// WhatsApp Business API integration for Brazil
import { Procedure, Employee } from '@/types/taimeline'
import { availabilityApi } from '@/lib/api/taimeline'

export interface WhatsAppMessage {
  from: string // Brazilian phone number format: +5511999999999
  to: string
  text: string
  timestamp: string
  messageId: string
}

export interface WhatsAppBusinessConfig {
  phoneNumberId: string // Meta Business API Phone Number ID
  accessToken: string // Meta Business API Access Token
  webhookVerifyToken: string
  businessPhone: string // Brazilian business number: +5511999999999
}

export class WhatsAppService {
  private config: WhatsAppBusinessConfig

  constructor(config: WhatsAppBusinessConfig) {
    this.config = config
  }

  async sendMessage(to: string, message: string): Promise<void> {
    // Format Brazilian phone number (remove + and ensure it starts with 55)
    const formattedNumber = this.formatBrazilianNumber(to)

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formattedNumber,
            type: 'text',
            text: { body: message }
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `Failed to send WhatsApp message: ${response.statusText} - ${JSON.stringify(errorData)}`
        )
      }
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      throw error
    }
  }

  private formatBrazilianNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '')

    // If it starts with +55, remove the +
    if (phoneNumber.startsWith('+55')) {
      cleaned = phoneNumber.substring(1)
    }

    // If it doesn't start with 55, add Brazil country code
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned
    }

    // Brazilian mobile numbers should be 13 digits (55 + 11 digits)
    // Landline numbers should be 12 digits (55 + 10 digits)
    if (cleaned.length !== 12 && cleaned.length !== 13) {
      console.warn(`Invalid Brazilian phone number format: ${phoneNumber}`)
    }

    return cleaned
  }

  async sendAvailableSlots(
    to: string,
    slots: { employee_name: string; start_datetime: string; end_datetime: string }[]
  ): Promise<void> {
    let message = 'Here are the available appointment slots:\n\n'

    slots.forEach((slot, index) => {
      const startTime = new Date(slot.start_datetime)
      const endTime = new Date(slot.end_datetime)

      message += `${index + 1}. ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString(
        'en-US',
        {
          hour: 'numeric',
          minute: '2-digit'
        }
      )} - ${endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })}\n   with ${slot.employee_name}\n\n`
    })

    message +=
      "Please reply with the number of your preferred slot (e.g., '1' for the first option)."

    await this.sendMessage(to, message)
  }

  async sendConfirmation(
    to: string,
    appointmentDetails: {
      procedure: string
      date: string
      time: string
      employee: string
    }
  ): Promise<void> {
    const message =
      `✅ Your appointment has been confirmed!\n\n` +
      `Service: ${appointmentDetails.procedure}\n` +
      `Date: ${appointmentDetails.date}\n` +
      `Time: ${appointmentDetails.time}\n` +
      `With: ${appointmentDetails.employee}\n\n` +
      `We'll send you a reminder 24 hours before your appointment. If you need to reschedule or cancel, please let us know as soon as possible.`

    await this.sendMessage(to, message)
  }

  async sendWelcomeMessage(to: string, procedures: Procedure[]): Promise<void> {
    let message = 'Hello! Welcome to our appointment booking service. 👋\n\n'
    message += 'Here are our available services:\n\n'

    procedures.forEach((procedure, index) => {
      message += `${index + 1}. ${procedure.name} (${procedure.duration_minutes} min)`
      if (procedure.price) {
        message += ` - $${procedure.price}`
      }
      message += '\n'
    })

    message +=
      "\nPlease reply with the number of the service you'd like to book, or tell us what you need!"

    await this.sendMessage(to, message)
  }
}

// WhatsApp Webhook Handler
export class WhatsAppWebhookHandler {
  private whatsappService: WhatsAppService
  private businessId: string

  constructor(whatsappService: WhatsAppService, businessId: string) {
    this.whatsappService = whatsappService
    this.businessId = businessId
  }

  async handleIncomingMessage(
    message: WhatsAppMessage,
    procedures: Procedure[],
    employees: Employee[]
  ): Promise<void> {
    const messageText = message.text.toLowerCase().trim()

    // Check if this is a service selection (number)
    const serviceNumber = parseInt(messageText)
    if (!isNaN(serviceNumber) && serviceNumber > 0 && serviceNumber <= procedures.length) {
      const selectedProcedure = procedures[serviceNumber - 1]
      await this.handleServiceSelection(message.from, selectedProcedure, message.messageId)
      return
    }

    // Check if this is a slot selection (number)
    if (!isNaN(serviceNumber)) {
      await this.handleSlotSelection(message.from, serviceNumber, message.messageId)
      return
    }

    // Handle text-based queries
    if (
      messageText.includes('appointment') ||
      messageText.includes('booking') ||
      messageText.includes('schedule')
    ) {
      await this.whatsappService.sendWelcomeMessage(message.from, procedures)
      return
    }

    if (messageText.includes('cancel') || messageText.includes('reschedule')) {
      await this.handleCancellationOrReschedule(message.from, messageText)
      return
    }

    // Default response
    await this.whatsappService.sendMessage(
      message.from,
      "Hi! I can help you book an appointment. Please let me know what service you're interested in, or type 'appointment' to see our available services."
    )
  }

  private async handleServiceSelection(
    clientPhone: string,
    procedure: Procedure,
    conversationId: string
  ): Promise<void> {
    try {
      // Find available slots for the selected procedure
      const availableSlots = await availabilityApi.findAvailableSlots(
        this.businessId,
        procedure.id,
        new Date(),
        7 // Look 7 days ahead
      )

      if (availableSlots.length === 0) {
        await this.whatsappService.sendMessage(
          clientPhone,
          `Sorry, we don't have any available slots for ${procedure.name} in the next week. Please call us directly or try again later.`
        )
        return
      }

      // Create a potential event record
      // TODO: This would be implemented with your Supabase API
      console.log('Creating potential event for:', {
        clientPhone,
        procedure: procedure.id,
        availableSlots
      })

      // Send available slots to client
      await this.whatsappService.sendAvailableSlots(clientPhone, availableSlots)
    } catch (error) {
      console.error('Error handling service selection:', error)
      await this.whatsappService.sendMessage(
        clientPhone,
        'Sorry, there was an error processing your request. Please try again or call us directly.'
      )
    }
  }

  private async handleSlotSelection(
    clientPhone: string,
    slotNumber: number,
    conversationId: string
  ): Promise<void> {
    // TODO: Implement slot selection logic
    // This would:
    // 1. Find the potential event for this client
    // 2. Get the selected slot from available slots
    // 3. Update the potential event status to 'awaiting_approval'
    // 4. Send confirmation message to client
    // 5. Notify admin about pending approval

    console.log('Handling slot selection:', { clientPhone, slotNumber, conversationId })

    await this.whatsappService.sendMessage(
      clientPhone,
      "Thank you for selecting your preferred time slot! We'll confirm your appointment shortly and send you a confirmation message."
    )
  }

  private async handleCancellationOrReschedule(
    clientPhone: string,
    message: string
  ): Promise<void> {
    // TODO: Implement cancellation/rescheduling logic
    // This would:
    // 1. Find existing appointments for this client
    // 2. Allow them to select which appointment to modify
    // 3. Handle the cancellation or rescheduling process

    console.log('Handling cancellation/reschedule:', { clientPhone, message })

    await this.whatsappService.sendMessage(
      clientPhone,
      "I understand you'd like to cancel or reschedule an appointment. Please call us directly at [PHONE_NUMBER] or provide more details about which appointment you'd like to modify."
    )
  }
}
