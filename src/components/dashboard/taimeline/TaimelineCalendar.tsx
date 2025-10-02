import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Plus, Settings, Phone } from 'lucide-react'
import { CalendarView, CalendarEvent, Employee, Procedure, PotentialEvent } from '@/types/taimeline'
import { eventApi, employeeApi, procedureApi, potentialEventApi } from '@/lib/api/taimeline'
import { WeekCalendar } from './calendar/WeekCalendar'
import { MonthCalendar } from './calendar/MonthCalendar'
import { DayCalendar } from './calendar/DayCalendar'
import { EmployeeSidebar } from './calendar/EmployeeSidebar'
import { EventDialog } from './calendar/EventDialog'
import { PotentialEventsPanel } from './calendar/PotentialEventsPanel'
import { CalendarSettings } from './calendar/CalendarSettings'
import { EmployeeDialog } from './EmployeeDialog'
import { ProcedureDialog } from './ProcedureDialog'

interface TaimelineCalendarProps {
  businessId: string
}

export function TaimelineCalendar({ businessId }: TaimelineCalendarProps) {
  const [currentView, setCurrentView] = useState<CalendarView>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEmployee, setSelectedEmployee] = useState<string | 'all'>('all')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [potentialEvents, setPotentialEvents] = useState<PotentialEvent[]>([])
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showPotentialEvents, setShowPotentialEvents] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false)
  const [showProcedureDialog, setShowProcedureDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCalendarData()
  }, [businessId, currentDate, selectedEmployee])

  const loadCalendarData = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API calls
      await Promise.all([loadEvents(), loadEmployees(), loadProcedures(), loadPotentialEvents()])
    } catch (error) {
      console.error('Failed to load calendar data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadEvents = async () => {
    try {
      const startDate = new Date(currentDate)
      startDate.setDate(1) // Start of month
      const endDate = new Date(currentDate)
      endDate.setMonth(endDate.getMonth() + 1) // End of month

      const events = await eventApi.getByDateRange(
        businessId,
        startDate,
        endDate,
        selectedEmployee === 'all' ? undefined : selectedEmployee
      )
      setEvents(events)
    } catch (error) {
      console.error('Failed to load events:', error)
      setEvents([]) // Fallback to empty array
    }
  }

  const loadEmployees = async () => {
    try {
      const employees = await employeeApi.getAll(businessId)
      setEmployees(employees)
    } catch (error) {
      console.error('Failed to load employees:', error)
      setEmployees([])
    }
  }

  const loadProcedures = async () => {
    try {
      const procedures = await procedureApi.getAll(businessId)
      setProcedures(procedures)
    } catch (error) {
      console.error('Failed to load procedures:', error)
      setProcedures([])
    }
  }

  const loadPotentialEvents = async () => {
    try {
      const potentialEvents = await potentialEventApi.getAll(businessId)
      setPotentialEvents(potentialEvents)
    } catch (error) {
      console.error('Failed to load potential events:', error)
      setPotentialEvents([])
    }
  }

  const handleEmployeeSave = async (
    employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      if (editingEmployee) {
        await employeeApi.update(editingEmployee.id, employeeData)
      } else {
        await employeeApi.create(businessId, employeeData)
      }
      await loadEmployees()
      setShowEmployeeDialog(false)
      setEditingEmployee(null)
    } catch (error) {
      console.error('Failed to save employee:', error)
    }
  }

  const handleProcedureSave = async (
    procedureData: Omit<Procedure, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      if (selectedProcedure) {
        await procedureApi.update(selectedProcedure.id, procedureData)
      } else {
        await procedureApi.create(businessId, procedureData)
      }
      await loadProcedures()
      setShowProcedureDialog(false)
      setSelectedProcedure(null)
    } catch (error) {
      console.error('Failed to save procedure:', error)
    }
  }

  const handleEventCreate = (slotInfo: { date: Date; time?: string; employeeId?: string }) => {
    // Convert slot info to initial event data
    const startDateTime = new Date(slotInfo.date)
    if (slotInfo.time) {
      const [hours, minutes] = slotInfo.time.split(':').map(Number)
      startDateTime.setHours(hours, minutes, 0, 0)
    }

    setSelectedEvent(null)
    setShowEventDialog(true)
  }

  const handleEventEdit = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventDialog(true)
  }

  const handleEventSave = async (eventData: Partial<CalendarEvent>) => {
    try {
      const completeEventData = {
        ...eventData,
        source: 'admin' as const, // Admin bookings are auto-approved
        status: 'confirmed' as const // Auto-approve admin bookings
      }

      if (selectedEvent) {
        // Update existing event
        await eventApi.update(selectedEvent.id, completeEventData)
      } else {
        // Create new event
        await eventApi.create(
          businessId,
          completeEventData as Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>
        )
      }
      await loadEvents()
      setShowEventDialog(false)
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const filteredEvents =
    selectedEmployee === 'all'
      ? events
      : events.filter((event) => event.employee_id === selectedEmployee)

  const pendingPotentialEvents = potentialEvents.filter(
    (event) => event.status === 'pending_selection' || event.status === 'awaiting_approval'
  )

  const renderCalendarView = () => {
    const commonProps = {
      events: filteredEvents,
      employees,
      currentDate,
      onEventClick: handleEventEdit,
      onTimeSlotClick: handleEventCreate,
      isLoading
    }

    switch (currentView) {
      case 'month':
        return <MonthCalendar {...commonProps} />
      case 'week':
        return <WeekCalendar {...commonProps} />
      case 'day':
        return <DayCalendar {...commonProps} />
      default:
        return <WeekCalendar {...commonProps} />
    }
  }

  return (
    <div className='flex h-screen bg-background'>
      {/* Employee Sidebar */}
      <EmployeeSidebar
        employees={employees}
        selectedEmployee={selectedEmployee}
        onEmployeeSelect={setSelectedEmployee}
        onEmployeeEdit={(employee: Employee) => {
          setSelectedEmployee(employee.id)
          setShowSettings(true)
        }}
      />

      {/* Main Calendar Area */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <div className='border-b px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <h1 className='text-2xl font-semibold'>Taimeline Calendar</h1>
              <div className='flex items-center space-x-2'>
                {['month', 'week', 'day'].map((view) => (
                  <Button
                    key={view}
                    variant={currentView === view ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setCurrentView(view as CalendarView)}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              {pendingPotentialEvents.length > 0 && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowPotentialEvents(true)}
                  className='relative'
                >
                  <Phone className='h-4 w-4 mr-2' />
                  WhatsApp Requests
                  <Badge className='ml-2 h-5 w-5 p-0 flex items-center justify-center'>
                    {pendingPotentialEvents.length}
                  </Badge>
                </Button>
              )}

              <Button variant='outline' size='sm' onClick={() => setShowEmployeeDialog(true)}>
                <Users className='h-4 w-4 mr-2' />
                Add Employee
              </Button>

              <Button variant='outline' size='sm' onClick={() => setShowProcedureDialog(true)}>
                <Clock className='h-4 w-4 mr-2' />
                Add Procedure
              </Button>

              <Button variant='outline' size='sm' onClick={() => setShowSettings(true)}>
                <Settings className='h-4 w-4 mr-2' />
                Settings
              </Button>

              <Button onClick={() => handleEventCreate({ date: new Date() })}>
                <Plus className='h-4 w-4 mr-2' />
                New Event
              </Button>
            </div>
          </div>

          {/* Date Navigation */}
          <div className='flex items-center justify-between mt-4'>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  const newDate = new Date(currentDate)
                  if (currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1)
                  } else if (currentView === 'week') {
                    newDate.setDate(newDate.getDate() - 7)
                  } else {
                    newDate.setDate(newDate.getDate() - 1)
                  }
                  setCurrentDate(newDate)
                }}
              >
                Previous
              </Button>

              <Button variant='outline' size='sm' onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  const newDate = new Date(currentDate)
                  if (currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1)
                  } else if (currentView === 'week') {
                    newDate.setDate(newDate.getDate() + 7)
                  } else {
                    newDate.setDate(newDate.getDate() + 1)
                  }
                  setCurrentDate(newDate)
                }}
              >
                Next
              </Button>
            </div>

            <h2 className='text-lg font-medium'>
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
                ...(currentView === 'day' && { day: 'numeric' })
              })}
            </h2>
          </div>
        </div>

        {/* Calendar Content */}
        <div className='flex-1 overflow-auto'>{renderCalendarView()}</div>
      </div>

      {/* Dialogs */}
      {showEventDialog && (
        <EventDialog
          event={selectedEvent}
          employees={employees}
          procedures={procedures}
          onSave={handleEventSave}
          onClose={() => setShowEventDialog(false)}
        />
      )}

      {showPotentialEvents && (
        <PotentialEventsPanel
          potentialEvents={pendingPotentialEvents}
          employees={employees}
          procedures={procedures}
          onApprove={async (eventId: string) => {
            try {
              await potentialEventApi.approve(eventId)
              await loadPotentialEvents()
            } catch (error) {
              console.error('Failed to approve event:', error)
            }
          }}
          onReject={async (eventId: string) => {
            try {
              await potentialEventApi.reject(eventId)
              await loadPotentialEvents()
            } catch (error) {
              console.error('Failed to reject event:', error)
            }
          }}
          onClose={() => setShowPotentialEvents(false)}
        />
      )}

      {showSettings && (
        <CalendarSettings businessId={businessId} onClose={() => setShowSettings(false)} />
      )}

      {showEmployeeDialog && (
        <EmployeeDialog
          employee={editingEmployee}
          onSave={handleEmployeeSave}
          onClose={() => {
            setShowEmployeeDialog(false)
            setEditingEmployee(null)
          }}
        />
      )}

      {showProcedureDialog && (
        <ProcedureDialog
          procedure={selectedProcedure}
          onSave={handleProcedureSave}
          onClose={() => {
            setShowProcedureDialog(false)
            setSelectedProcedure(null)
          }}
        />
      )}
    </div>
  )
}
