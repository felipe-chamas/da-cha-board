# Taimeline Service Setup Guide

## Overview

The Taimeline service is a Google Calendar-like interface for appointment scheduling with WhatsApp integration and Google Calendar sync.

## Features Implemented

### Core Calendar System

- ✅ Month/Week/Day calendar views
- ✅ Employee sidebar with schedule preview
- ✅ Event CRUD operations (Create, Read, Update, Delete)
- ✅ Drag-and-drop time slot management
- ✅ Procedure-based scheduling with duration
- ✅ Conflict detection and availability checking

### WhatsApp Integration (Brazil)

- ✅ Meta Business API integration
- ✅ Brazilian phone number formatting (+55)
- ✅ Automated booking flow
- ✅ Approval workflow for WhatsApp requests
- ✅ Webhook endpoint for message handling

### Google Calendar Integration

- ✅ OAuth2 authentication
- ✅ Bidirectional sync
- ✅ Event creation/update/deletion
- ✅ Per-business admin account support

### Database Schema

- ✅ Complete Supabase schema
- ✅ Business isolation with RLS
- ✅ Employee management
- ✅ Procedure definitions
- ✅ Calendar events
- ✅ Potential events (WhatsApp requests)
- ✅ Integration settings

## Setup Instructions

### 1. Database Setup

```sql
-- Run the schema in supabase/schema.sql
-- This creates all necessary tables and RLS policies
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# WhatsApp (Meta Business API)
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id

# Google Calendar
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. WhatsApp Business API Setup (Brazil)

1. Create Meta Business App at https://developers.facebook.com/
2. Add WhatsApp Business API product
3. Get a Brazilian phone number (+55)
4. Configure webhook URL: `https://your-domain.com/api/whatsapp/webhook`
5. Subscribe to message events

### 4. Google Calendar Setup

1. Create project in Google Cloud Console
2. Enable Calendar API
3. Create OAuth2 credentials
4. Add redirect URI: `https://your-domain.com/api/auth/google/callback`

## Usage Flow

### Admin Workflow

1. **Employee Management**: Add employees with work schedules
2. **Procedure Setup**: Define services with duration and pricing
3. **Time Slot Management**: Drag-drop procedures to create schedules
4. **Event Creation**: Direct booking (auto-approved)
5. **WhatsApp Approval**: Review and approve client requests

### Client WhatsApp Flow

1. **Message Business**: Client sends WhatsApp message
2. **Service Selection**: Bot shows available services
3. **Time Selection**: Shows available slots
4. **Approval Pending**: Admin reviews request
5. **Confirmation**: Client receives confirmation message

### Calendar Views

- **Month View**: Overview with event indicators
- **Week View**: Detailed 7-day schedule
- **Day View**: Hour-by-hour breakdown

## Key Components

### Calendar Components

- `TaimelineCalendar`: Main calendar interface
- `WeekCalendar`: Week view implementation
- `MonthCalendar`: Month view implementation
- `DayCalendar`: Day view implementation
- `EmployeeSidebar`: Employee selection and management
- `EventDialog`: Event creation/editing form
- `PotentialEventsPanel`: WhatsApp request approval
- `CalendarSettings`: Integration configuration
- `TimeSlotManager`: Drag-drop schedule builder

### API Integrations

- `google-calendar.ts`: Google Calendar API service
- `whatsapp.ts`: WhatsApp Business API service
- `taimeline.ts`: Supabase CRUD operations

### Database Tables

- `employees`: Staff members and schedules
- `procedures`: Services with duration/pricing
- `calendar_events`: Confirmed appointments
- `potential_events`: WhatsApp requests pending approval
- `google_calendar_integrations`: Google sync settings
- `whatsapp_integrations`: WhatsApp bot configuration

## Business Logic

### Auto-Approval Rules

- **Admin Bookings**: Automatically confirmed
- **WhatsApp Requests**: Require admin approval
- **Google Calendar**: Synced based on settings

### Conflict Management

- Check employee availability
- Respect work schedule hours
- Prevent double-booking
- Show available alternatives

### Brazilian WhatsApp Features

- Format phone numbers correctly (+5511...)
- Handle Brazilian time zones
- Portuguese language support ready
- Local business hour handling

## Integration Points

### Generated Dashboard Integration

When generating a business dashboard:

1. Include Taimeline service files
2. Create default employee (business owner)
3. Set up basic procedures
4. Configure integration settings
5. Generate webhook URLs

### Supabase Project Creation

For each generated business:

1. Create business record
2. Set up RLS policies
3. Generate API keys
4. Configure webhook endpoints

## Next Steps for Production

### Immediate V0 Improvements

1. **Real API Integration**: Connect Supabase operations
2. **Error Handling**: User-friendly error messages
3. **Loading States**: Better UX during operations
4. **Validation**: Form and data validation
5. **Notifications**: Success/error feedback

### Future Enhancements

1. **Multi-location Support**: Multiple business locations
2. **Employee Portal**: Separate employee interface
3. **Advanced Scheduling**: Recurring appointments
4. **Analytics**: Booking insights and reporting
5. **Payment Integration**: Online payment processing

## Support for Business Generation

The Taimeline service is designed to be included in generated business dashboards:

1. **Template Files**: All components ready for code generation
2. **Configuration**: Business-specific settings
3. **Database Schema**: Isolated per business
4. **Webhook URLs**: Unique per business
5. **Integration Keys**: Separate API access

This makes it perfect for your repository generator platform where each business gets their own complete dashboard with Taimeline included.
