import { Employee } from '@/types/taimeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmployeeSidebarProps {
  employees: Employee[]
  selectedEmployee: string | 'all'
  onEmployeeSelect: (employeeId: string | 'all') => void
  onEmployeeEdit: (employee: Employee) => void
}

export function EmployeeSidebar({
  employees,
  selectedEmployee,
  onEmployeeSelect,
  onEmployeeEdit
}: EmployeeSidebarProps) {
  const getEmployeeInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const getEmployeeColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
    return colors[index % colors.length]
  }

  const activeEmployees = employees.filter((emp) => emp.is_active)

  return (
    <div className='w-80 border-r bg-background flex flex-col'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center space-x-2'>
          <Users className='h-5 w-5' />
          <span>Team</span>
        </CardTitle>
      </CardHeader>

      <CardContent className='flex-1 space-y-2'>
        {/* All employees option */}
        <Button
          variant={selectedEmployee === 'all' ? 'default' : 'ghost'}
          className='w-full justify-start'
          onClick={() => onEmployeeSelect('all')}
        >
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
              <Users className='h-4 w-4 text-primary-foreground' />
            </div>
            <div className='flex-1 text-left'>
              <div className='font-medium'>All Employees</div>
              <div className='text-xs text-muted-foreground'>{activeEmployees.length} active</div>
            </div>
          </div>
        </Button>

        {/* Individual employees */}
        <div className='space-y-1'>
          {activeEmployees.map((employee, index) => (
            <Button
              key={employee.id}
              variant={selectedEmployee === employee.id ? 'default' : 'ghost'}
              className='w-full justify-start p-3 h-auto'
              onClick={() => onEmployeeSelect(employee.id)}
            >
              <div className='flex items-center space-x-3 w-full'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={employee.avatar_url} />
                  <AvatarFallback className={getEmployeeColor(index)}>
                    {getEmployeeInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>

                <div className='flex-1 text-left'>
                  <div className='font-medium'>{employee.name}</div>
                  <div className='text-xs text-muted-foreground'>{employee.role}</div>
                </div>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation()
                    onEmployeeEdit(employee)
                  }}
                  className='opacity-0 group-hover:opacity-100 h-6 w-6 p-0'
                >
                  <Settings className='h-3 w-3' />
                </Button>
              </div>
            </Button>
          ))}
        </div>

        {/* Work schedule preview for selected employee */}
        {selectedEmployee !== 'all' && (
          <Card className='mt-4'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm'>Work Schedule</CardTitle>
            </CardHeader>
            <CardContent className='space-y-1'>
              {(() => {
                const employee = employees.find((emp) => emp.id === selectedEmployee)
                if (!employee) return null

                const days = [
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday',
                  'sunday'
                ] as const
                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

                return days.map((day, index) => {
                  const schedule = employee.work_schedule[day]
                  const hasSchedule = schedule.length > 0

                  return (
                    <div key={day} className='flex justify-between items-center text-xs'>
                      <span className={cn('font-medium', !hasSchedule && 'text-muted-foreground')}>
                        {dayNames[index]}
                      </span>
                      <span className={cn(!hasSchedule && 'text-muted-foreground')}>
                        {hasSchedule
                          ? schedule.map((slot) => `${slot.start}-${slot.end}`).join(', ')
                          : 'Off'}
                      </span>
                    </div>
                  )
                })
              })()}
            </CardContent>
          </Card>
        )}
      </CardContent>

      {/* Add employee button */}
      <div className='p-4 border-t'>
        <Button
          variant='outline'
          className='w-full'
          onClick={() => {
            // TODO: Implement add employee dialog
            console.log('Add new employee')
          }}
        >
          <Plus className='h-4 w-4 mr-2' />
          Add Employee
        </Button>
      </div>
    </div>
  )
}
