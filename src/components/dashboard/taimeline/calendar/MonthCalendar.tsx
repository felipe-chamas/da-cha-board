import { CalendarEvent, Employee } from '@/types/taimeline'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MonthCalendarProps {
  events: CalendarEvent[]
  employees: Employee[]
  currentDate: Date
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (slotInfo: { date: Date; time?: string; employeeId?: string }) => void
  isLoading: boolean
}

export function MonthCalendar({
  events,
  employees,
  currentDate,
  onEventClick,
  onTimeSlotClick,
  isLoading
}: MonthCalendarProps) {
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDay = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return { days, currentMonth: month, currentYear: year }
  }

  const { days, currentMonth, currentYear } = getMonthDays(currentDate)

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_datetime)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEmployeeColor = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
    return colors[employees.indexOf(employee!) % colors.length] || 'bg-gray-500'
  }

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse'>
          <div className='grid grid-cols-7 gap-1'>
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className='h-32 bg-muted rounded' />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='grid grid-cols-7 gap-px bg-border'>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className='bg-muted p-3 text-center font-medium text-sm'>
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day)
          const isCurrentMonth = day.getMonth() === currentMonth
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <Card
              key={index}
              className={cn(
                'min-h-[120px] p-2 cursor-pointer hover:bg-muted/50 border-0 rounded-none',
                !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                isToday && 'ring-2 ring-primary'
              )}
              onClick={() => onTimeSlotClick({ date: day })}
            >
              <div className='flex justify-between items-start mb-2'>
                <span
                  className={cn(
                    'text-sm font-medium',
                    isToday &&
                      'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                  )}
                >
                  {day.getDate()}
                </span>
                {dayEvents.length > 3 && (
                  <Badge variant='secondary' className='text-xs'>
                    +{dayEvents.length - 3}
                  </Badge>
                )}
              </div>

              <div className='space-y-1'>
                {dayEvents.slice(0, 3).map((event) => {
                  const startTime = new Date(event.start_datetime)
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'text-xs p-1 rounded text-white truncate cursor-pointer',
                        getEmployeeColor(event.employee_id)
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      <div className='font-medium truncate'>
                        {startTime.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}{' '}
                        {event.title.split(' - ')[0]}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
