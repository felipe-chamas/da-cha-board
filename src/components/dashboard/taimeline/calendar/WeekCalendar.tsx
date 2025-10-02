import { CalendarEvent, Employee } from '@/types/taimeline'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WeekCalendarProps {
  events: CalendarEvent[]
  employees: Employee[]
  currentDate: Date
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (slotInfo: { date: Date; time: string; employeeId?: string }) => void
  isLoading: boolean
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00')

const BUSINESS_HOURS = { start: 8, end: 20 } // 8 AM to 8 PM

export function WeekCalendar({
  events,
  employees,
  currentDate,
  onEventClick,
  onTimeSlotClick,
  isLoading
}: WeekCalendarProps) {
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })
  }

  const weekDays = getWeekDays(currentDate)
  const businessHours = HOURS.slice(BUSINESS_HOURS.start, BUSINESS_HOURS.end)

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_datetime)
      return eventStart.toDateString() === date.toDateString() && eventStart.getHours() === hour
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
        <div className='animate-pulse'>
          <div className='grid grid-cols-8 gap-1'>
            {Array.from({ length: 8 * 12 }).map((_, i) => (
              <div key={i} className='h-16 bg-muted rounded' />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-auto'>
      <div className='min-w-[800px]'>
        {/* Header */}
        <div className='grid grid-cols-8 border-b sticky top-0 bg-background z-10'>
          <div className='p-3 border-r'>
            <div className='text-xs text-muted-foreground'>Time</div>
          </div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className='p-3 border-r text-center'>
              <div className='text-sm font-medium'>
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={cn(
                  'text-lg font-semibold',
                  day.toDateString() === new Date().toDateString() && 'text-primary'
                )}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className='grid grid-cols-8'>
          {businessHours.map((hour) => (
            <div key={hour} className='contents'>
              {/* Hour label */}
              <div className='p-2 border-r border-b text-xs text-muted-foreground min-h-[60px] flex items-start'>
                {hour}
              </div>

              {/* Day slots */}
              {weekDays.map((day) => {
                const hourNum = parseInt(hour.split(':')[0])
                const dayEvents = getEventsForDateAndHour(day, hourNum)

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className='border-r border-b min-h-[60px] p-1 hover:bg-muted/50 cursor-pointer relative'
                    onClick={() =>
                      onTimeSlotClick({
                        date: day,
                        time: hour
                      })
                    }
                  >
                    {dayEvents.map((event) => {
                      const startTime = new Date(event.start_datetime)
                      const endTime = new Date(event.end_datetime)
                      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes
                      const height = Math.max(duration, 30) // minimum 30 minutes display

                      return (
                        <Card
                          key={event.id}
                          className={cn(
                            'p-2 text-xs cursor-pointer mb-1 border-l-4',
                            getEmployeeColor(event.employee_id)
                          )}
                          style={{ minHeight: `${height / 2}px` }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick(event)
                          }}
                        >
                          <div className='font-medium truncate'>{event.title}</div>
                          <div className='text-muted-foreground truncate'>
                            {startTime.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                          {event.client_name && (
                            <div className='text-muted-foreground truncate'>
                              {event.client_name}
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
