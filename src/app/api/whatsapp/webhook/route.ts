// API route for WhatsApp webhook
import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService, WhatsAppWebhookHandler } from '@/lib/integrations/whatsapp'
import { procedureApi, employeeApi } from '@/lib/api/taimeline'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Webhook verification for Meta Business API
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified')
    return new NextResponse(challenge)
  }

  return new NextResponse('Verification failed', { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract message data from Meta Business API webhook payload
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (!value?.messages) {
      return new NextResponse('No messages found', { status: 200 })
    }

    const message = value.messages[0]
    const from = message.from // Brazilian phone number
    const text = message.text?.body || ''
    const messageId = message.id

    // Get business context from phone number or other identifier
    const businessId = await getBusinessIdFromWebhook(value.metadata?.phone_number_id)

    if (!businessId) {
      console.error('No business found for phone number ID:', value.metadata?.phone_number_id)
      return new NextResponse('Business not found', { status: 400 })
    }

    // Load business data
    const [procedures, employees] = await Promise.all([
      procedureApi.getAll(businessId),
      employeeApi.getAll(businessId)
    ])

    // Initialize WhatsApp service
    const whatsappConfig = {
      phoneNumberId: value.metadata.phone_number_id,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!,
      businessPhone: value.metadata.display_phone_number
    }

    const whatsappService = new WhatsAppService(whatsappConfig)
    const webhookHandler = new WhatsAppWebhookHandler(whatsappService, businessId)

    // Process the incoming message
    await webhookHandler.handleIncomingMessage(
      {
        from,
        to: value.metadata.display_phone_number,
        text,
        timestamp: new Date().toISOString(),
        messageId
      },
      procedures,
      employees
    )

    return new NextResponse('Message processed', { status: 200 })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

// Helper function to map phone number ID to business ID
async function getBusinessIdFromWebhook(phoneNumberId: string): Promise<string | null> {
  // TODO: Implement lookup from your database
  // This would query the whatsapp_integrations table to find the business
  // that owns this phone number ID

  // For now, return a mock business ID
  // In production, you'd do something like:
  /*
  const { data } = await supabase
    .from('whatsapp_integrations')
    .select('business_id')
    .eq('phone_number_id', phoneNumberId)
    .single()
  
  return data?.business_id || null
  */

  return 'demo-business-id' // Mock for development
}
