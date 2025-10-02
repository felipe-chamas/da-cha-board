import { CalendarEvent, Employee } from '@/types/taimeline'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DayCalendarProps {
  events: CalendarEvent[]
  employees: Employee[]
  currentDate: Date
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (slotInfo: { date: Date; time: string; employeeId?: string }) => void
  isLoading: boolean
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00')

const BUSINESS_HOURS = { start: 7, end: 22 } // 7 AM to 10 PM

export function DayCalendar({
  events,
  employees,
  currentDate,
  onEventClick,
  onTimeSlotClick,
  isLoading
}: DayCalendarProps) {
  const businessHours = HOURS.slice(BUSINESS_HOURS.start, BUSINESS_HOURS.end)

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_datetime)
      return (
        eventStart.toDateString() === currentDate.toDateString() && eventStart.getHours() === hour
      )
    })
  }

  const getEmployeeColor = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    const colors = [
      'bg-blue-100 border-blue-300',
      'bg-green-100 border-green-300',
      'bg-purple-100 border-purple-300',
      'bg-orange-100 border-orange-300'
    ]
    return colors[employees.indexOf(employee!) % colors.length] || 'bg-gray-100 border-gray-300'
  }

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse space-y-2'>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className='flex space-x-4'>
              <div className='w-16 h-16 bg-muted rounded' />
              <div className='flex-1 h-16 bg-muted rounded' />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-auto p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-6'>
          <h2 className='text-2xl font-semibold'>
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
        </div>

        <div className='space-y-px'>
          {businessHours.map((hour) => {
            const hourNum = parseInt(hour.split(':')[0])
            const hourEvents = getEventsForHour(hourNum)

            return (
              <div key={hour} className='flex'>
                {/* Time label */}
                <div className='w-20 py-4 pr-4 text-sm text-muted-foreground text-right'>
                  {hour}
                </div>

                {/* Event area */}
                <div
                  className='flex-1 min-h-[60px] border-t border-l pl-4 py-2 hover:bg-muted/50 cursor-pointer'
                  onClick={() =>
                    onTimeSlotClick({
                      date: currentDate,
                      time: hour
                    })
                  }
                >
                  <div className='space-y-2'>
                    {hourEvents.map((event) => {
                      const startTime = new Date(event.start_datetime)
                      const endTime = new Date(event.end_datetime)
                      const employee = employees.find((emp) => emp.id === event.employee_id)

                      return (
                        <Card
                          key={event.id}
                          className={cn(
                            'p-3 cursor-pointer border-l-4 max-w-md',
                            getEmployeeColor(event.employee_id)
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick(event)
                          }}
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <div className='font-medium'>{event.title}</div>
                            <div className='text-xs text-muted-foreground'>
                              {startTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}{' '}
                              -{' '}
                              {endTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>

                          {event.client_name && (
                            <div className='text-sm text-muted-foreground mb-1'>
                              Client: {event.client_name}
                            </div>
                          )}

                          {employee && (
                            <div className='text-sm text-muted-foreground'>
                              with {employee.name}
                            </div>
                          )}

                          {event.notes && (
                            <div className='text-sm text-muted-foreground mt-2 italic'>
                              {event.notes}
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
