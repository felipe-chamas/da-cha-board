import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Employee, WorkSchedule, TimeSlot } from '@/types/taimeline'
import { Trash2, Plus } from 'lucide-react'

interface EmployeeDialogProps {
  employee: Employee | null
  onSave: (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => void
  onClose: () => void
}

const DAYS = [
  { key: 'monday' as keyof WorkSchedule, label: 'Monday' },
  { key: 'tuesday' as keyof WorkSchedule, label: 'Tuesday' },
  { key: 'wednesday' as keyof WorkSchedule, label: 'Wednesday' },
  { key: 'thursday' as keyof WorkSchedule, label: 'Thursday' },
  { key: 'friday' as keyof WorkSchedule, label: 'Friday' },
  { key: 'saturday' as keyof WorkSchedule, label: 'Saturday' },
  { key: 'sunday' as keyof WorkSchedule, label: 'Sunday' }
]

export function EmployeeDialog({ employee, onSave, onClose }: EmployeeDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    is_active: true,
    work_schedule: {
      monday: [] as TimeSlot[],
      tuesday: [] as TimeSlot[],
      wednesday: [] as TimeSlot[],
      thursday: [] as TimeSlot[],
      friday: [] as TimeSlot[],
      saturday: [] as TimeSlot[],
      sunday: [] as TimeSlot[]
    } as WorkSchedule,
    avatar_url: ''
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '',
        role: employee.role,
        is_active: employee.is_active,
        work_schedule: employee.work_schedule,
        avatar_url: employee.avatar_url || ''
      })
    }
  }, [employee])

  const addTimeSlot = (day: keyof WorkSchedule) => {
    setFormData((prev) => ({
      ...prev,
      work_schedule: {
        ...prev.work_schedule,
        [day]: [...prev.work_schedule[day], { start: '09:00', end: '17:00' }]
      }
    }))
  }

  const removeTimeSlot = (day: keyof WorkSchedule, index: number) => {
    setFormData((prev) => ({
      ...prev,
      work_schedule: {
        ...prev.work_schedule,
        [day]: prev.work_schedule[day].filter((_, i) => i !== index)
      }
    }))
  }

  const updateTimeSlot = (
    day: keyof WorkSchedule,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      work_schedule: {
        ...prev.work_schedule,
        [day]: prev.work_schedule[day].map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='name'>Full Name</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='phone'>Phone</Label>
              <Input
                id='phone'
                type='tel'
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder='+55 11 99999-9999'
              />
            </div>
            <div>
              <Label htmlFor='role'>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: string) => setFormData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Manager'>Manager</SelectItem>
                  <SelectItem value='Stylist'>Stylist</SelectItem>
                  <SelectItem value='Barber'>Barber</SelectItem>
                  <SelectItem value='Therapist'>Therapist</SelectItem>
                  <SelectItem value='Technician'>Technician</SelectItem>
                  <SelectItem value='Assistant'>Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Work Schedule */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Work Schedule</h3>
            <div className='space-y-4'>
              {DAYS.map(({ key, label }) => (
                <Card key={key}>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm flex justify-between items-center'>
                      <span>{label}</span>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => addTimeSlot(key)}
                      >
                        <Plus className='h-3 w-3 mr-1' />
                        Add Shift
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    {formData.work_schedule[key].length === 0 ? (
                      <p className='text-sm text-muted-foreground'>No shifts scheduled</p>
                    ) : (
                      formData.work_schedule[key].map((slot, index) => (
                        <div key={index} className='flex items-center space-x-2'>
                          <Input
                            type='time'
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(key, index, 'start', e.target.value)}
                            className='w-32'
                          />
                          <span className='text-sm text-muted-foreground'>to</span>
                          <Input
                            type='time'
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(key, index, 'end', e.target.value)}
                            className='w-32'
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeTimeSlot(key, index)}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-2 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>{employee ? 'Update Employee' : 'Create Employee'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
