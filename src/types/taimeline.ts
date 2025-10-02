// Taimeline Service Types
export interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  is_active: boolean
  work_schedule: WorkSchedule
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface WorkSchedule {
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
}

export interface TimeSlot {
  start: string // HH:MM format
  end: string // HH:MM format
}

export interface Procedure {
  id: string
  name: string
  description?: string
  duration_minutes: number
  price?: number
  color: string
  is_active: boolean
  employee_ids: string[] // Which employees can perform this procedure
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_datetime: string // ISO string
  end_datetime: string // ISO string
  procedure_id?: string
  employee_id: string
  client_name?: string
  client_phone?: string
  client_email?: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  source: 'admin' | 'whatsapp' | 'google_calendar' | 'manual'
  google_calendar_event_id?: string
  whatsapp_message_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PotentialEvent {
  id: string
  client_phone: string
  client_name?: string
  procedure_id: string
  requested_date?: string
  requested_time?: string
  available_slots: AvailableSlot[]
  status: 'pending_selection' | 'awaiting_approval' | 'approved' | 'rejected' | 'expired'
  whatsapp_conversation_id: string
  created_at: string
  updated_at: string
}

export interface AvailableSlot {
  employee_id: string
  employee_name: string
  start_datetime: string
  end_datetime: string
}

export interface GoogleCalendarIntegration {
  id: string
  employee_id: string
  google_calendar_id: string
  access_token: string
  refresh_token: string
  is_active: boolean
  sync_direction: 'both' | 'from_google' | 'to_google'
  created_at: string
  updated_at: string
}

export interface WhatsAppIntegration {
  id: string
  business_phone: string
  webhook_url: string
  access_token: string
  is_active: boolean
  bot_settings: {
    welcome_message: string
    instructions: string
    business_hours: WorkSchedule
  }
  created_at: string
  updated_at: string
}

// Calendar view types
export type CalendarView = 'month' | 'week' | 'day' | 'agenda'

export interface CalendarSettings {
  default_view: CalendarView
  time_slot_duration: number // minutes
  business_hours: WorkSchedule
  timezone: string
}
