// Google Calendar API integration
import { CalendarEvent } from '@/types/taimeline'

interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: { email: string }[]
}

export interface GoogleCalendarConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  accessToken: string
  refreshToken: string
  calendarId: string
}

export class GoogleCalendarService {
  private config: GoogleCalendarConfig

  constructor(config: GoogleCalendarConfig) {
    this.config = config
  }

  async refreshAccessToken(): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token'
      })
    })

    const data = await response.json()
    this.config.accessToken = data.access_token
    return data.access_token
  }

  async createEvent(event: CalendarEvent): Promise<string> {
    const googleEvent = {
      summary: event.title,
      description: event.description || '',
      start: {
        dateTime: event.start_datetime,
        timeZone: 'America/New_York' // TODO: Make this configurable
      },
      end: {
        dateTime: event.end_datetime,
        timeZone: 'America/New_York'
      },
      attendees: event.client_email ? [{ email: event.client_email }] : []
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.config.calendarId}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(googleEvent)
        }
      )

      if (response.status === 401) {
        // Token expired, refresh and retry
        await this.refreshAccessToken()
        return this.createEvent(event)
      }

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error)
      throw error
    }
  }

  async updateEvent(googleEventId: string, event: CalendarEvent): Promise<void> {
    const googleEvent = {
      summary: event.title,
      description: event.description || '',
      start: {
        dateTime: event.start_datetime,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: event.end_datetime,
        timeZone: 'America/New_York'
      },
      attendees: event.client_email ? [{ email: event.client_email }] : []
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.config.calendarId}/events/${googleEventId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(googleEvent)
        }
      )

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.updateEvent(googleEventId, event)
      }

      if (!response.ok) {
        throw new Error(`Failed to update Google Calendar event: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to update Google Calendar event:', error)
      throw error
    }
  }

  async deleteEvent(googleEventId: string): Promise<void> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.config.calendarId}/events/${googleEventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`
          }
        }
      )

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.deleteEvent(googleEventId)
      }

      if (!response.ok && response.status !== 410) {
        // 410 = Already deleted
        throw new Error(`Failed to delete Google Calendar event: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to delete Google Calendar event:', error)
      throw error
    }
  }

  async syncFromGoogle(startDate: Date, endDate: Date): Promise<GoogleCalendarEvent[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.config.calendarId}/events?` +
          new URLSearchParams({
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime'
          }),
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`
          }
        }
      )

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.syncFromGoogle(startDate, endDate)
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Failed to sync from Google Calendar:', error)
      throw error
    }
  }
}
