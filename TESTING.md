# Taimeline Testing Checklist

## Setup Required

### 1. Environment
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Supabase credentials
- [ ] Run `npm install` (all deps present)

### 2. Database
- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] Create test business record
- [ ] Verify RLS policies enabled

### 3. Optional Integrations (can skip for basic testing)
- [ ] WhatsApp: Add Meta credentials (for WhatsApp bot)
- [ ] Google Calendar: Add OAuth credentials (for calendar sync)

## Local Test Flow

### Basic Calendar Functions
1. [ ] `npm run dev` → http://localhost:3000
2. [ ] Navigate to Taimeline service section
3. [ ] Add employee (name, schedule hours)
4. [ ] Add procedure (service name, duration, price)
5. [ ] Create event (select employee, procedure, date/time)
6. [ ] View event in Month/Week/Day views
7. [ ] Edit existing event
8. [ ] Delete event

### Time Slot Manager
1. [ ] Open TimeSlotManager
2. [ ] Drag procedure cards to time slots
3. [ ] Create schedule blocks
4. [ ] Verify conflict detection
5. [ ] Save schedule template

### WhatsApp Integration (requires Meta setup)
1. [ ] Configure webhook: `/api/whatsapp/webhook`
2. [ ] Send test message to business number
3. [ ] Verify bot responds with procedure list
4. [ ] Request appointment through bot
5. [ ] Check PotentialEventsPanel for pending request
6. [ ] Approve/reject request
7. [ ] Verify WhatsApp confirmation sent

### Google Calendar Sync (requires OAuth setup)
1. [ ] Open CalendarSettings
2. [ ] Connect Google account
3. [ ] Create event in Taimeline
4. [ ] Verify synced to Google Calendar
5. [ ] Edit in Google, verify sync back
6. [ ] Test bidirectional sync

## Current Status

✅ **Complete & Ready**:
- UI components (all calendar views)
- Database schema
- Type definitions
- API structure (taimeline.ts)
- WhatsApp webhook endpoint
- Google Calendar integration code
- Brazilian phone formatting

⚠️ **Needs Testing**:
- Supabase connection (add .env)
- CRUD operations flow
- Conflict detection logic
- WhatsApp bot conversation flow
- Google OAuth flow

🔧 **Known Issues**:
- TODOs in TaimelineCalendar.tsx (mock data → real API)
- CalendarSettings save function (placeholder)
- EmployeeSidebar add dialog (commented)

## Quick Start Command

```bash
# Install & run
npm install
npm run dev

# Open browser
http://localhost:3000
```

## Minimal Test (No External APIs)

Just test UI/navigation:
1. Skip .env setup initially
2. Run dev server
3. Navigate UI components
4. Test with mock data in browser console
5. Add .env only when ready for real API testing

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Taimeline service complete"
git remote add origin your-github-repo-url
git push -u origin main
```
