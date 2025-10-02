import { CalendarEvent, Employee, Procedure } from '@/types/taimeline'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useState, useEffect } from 'react'

interface EventDialogProps {
  event: CalendarEvent | null
  employees: Employee[]
  procedures: Procedure[]
  onSave: (eventData: Partial<CalendarEvent>) => void
  onClose: () => void
}

export function EventDialog({ event, employees, procedures, onSave, onClose }: EventDialogProps) {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    start_datetime: string
    end_datetime: string
    procedure_id: string
    employee_id: string
    client_name: string
    client_phone: string
    client_email: string
    notes: string
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  }>({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    procedure_id: '',
    employee_id: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    notes: '',
    status: 'confirmed'
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_datetime: event.start_datetime
          ? new Date(event.start_datetime).toISOString().slice(0, 16)
          : '',
        end_datetime: event.end_datetime
          ? new Date(event.end_datetime).toISOString().slice(0, 16)
          : '',
        procedure_id: event.procedure_id || '',
        employee_id: event.employee_id || '',
        client_name: event.client_name || '',
        client_phone: event.client_phone || '',
        client_email: event.client_email || '',
        notes: event.notes || '',
        status: event.status || 'confirmed'
      })
    } else {
      // Reset form for new event
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

      setFormData({
        title: '',
        description: '',
        start_datetime: now.toISOString().slice(0, 16),
        end_datetime: oneHourLater.toISOString().slice(0, 16),
        procedure_id: '',
        employee_id: employees[0]?.id || '',
        client_name: '',
        client_phone: '',
        client_email: '',
        notes: '',
        status: 'confirmed'
      })
    }
  }, [event, employees])

  useEffect(() => {
    // Auto-update end time based on procedure duration
    if (formData.procedure_id && formData.start_datetime) {
      const procedure = procedures.find((p) => p.id === formData.procedure_id)
      if (procedure) {
        const startTime = new Date(formData.start_datetime)
        const endTime = new Date(startTime.getTime() + procedure.duration_minutes * 60 * 1000)
        setFormData((prev) => ({
          ...prev,
          end_datetime: endTime.toISOString().slice(0, 16),
          title: `${procedure.name}${prev.client_name ? ` - ${prev.client_name}` : ''}`
        }))
      }
    }
  }, [formData.procedure_id, formData.start_datetime, formData.client_name, procedures])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const eventData: Partial<CalendarEvent> = {
      ...formData,
      start_datetime: new Date(formData.start_datetime).toISOString(),
      end_datetime: new Date(formData.end_datetime).toISOString()
    }

    onSave(eventData)
  }

  const handleDelete = async () => {
    if (event && window.confirm('Are you sure you want to delete this event?')) {
      // TODO: Implement delete functionality
      console.log('Delete event:', event.id)
      onClose()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='procedure'>Procedure</Label>
              <Select
                value={formData.procedure_id}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, procedure_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select procedure' />
                </SelectTrigger>
                <SelectContent>
                  {procedures
                    .filter((p) => p.is_active)
                    .map((procedure) => (
                      <SelectItem key={procedure.id} value={procedure.id}>
                        {procedure.name} ({procedure.duration_minutes}min)
                        {procedure.price && ` - $${procedure.price}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='employee'>Employee</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, employee_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select employee' />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((emp) => emp.is_active)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder='Event title'
              required
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='start_datetime'>Start Date & Time</Label>
              <Input
                id='start_datetime'
                type='datetime-local'
                value={formData.start_datetime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, start_datetime: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor='end_datetime'>End Date & Time</Label>
              <Input
                id='end_datetime'
                type='datetime-local'
                value={formData.end_datetime}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_datetime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div>
              <Label htmlFor='client_name'>Client Name</Label>
              <Input
                id='client_name'
                value={formData.client_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    client_name: e.target.value,
                    title: formData.procedure_id
                      ? `${procedures.find((p) => p.id === formData.procedure_id)?.name || ''} - ${
                          e.target.value
                        }`
                      : e.target.value
                  }))
                }
                placeholder='Client name'
              />
            </div>

            <div>
              <Label htmlFor='client_phone'>Client Phone</Label>
              <Input
                id='client_phone'
                type='tel'
                value={formData.client_phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, client_phone: e.target.value }))}
                placeholder='+1 (555) 123-4567'
              />
            </div>

            <div>
              <Label htmlFor='client_email'>Client Email</Label>
              <Input
                id='client_email'
                type='email'
                value={formData.client_email}
                onChange={(e) => setFormData((prev) => ({ ...prev, client_email: e.target.value }))}
                placeholder='client@example.com'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='status'>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: string) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as 'confirmed' | 'pending' | 'cancelled' | 'completed'
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='confirmed'>Confirmed</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='cancelled'>Cancelled</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='notes'>Notes</Label>
            <Textarea
              id='notes'
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder='Additional notes...'
              rows={3}
            />
          </div>

          <div className='flex justify-between pt-4'>
            <div>
              {event && (
                <Button type='button' variant='destructive' onClick={handleDelete}>
                  Delete Event
                </Button>
              )}
            </div>

            <div className='space-x-2'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit'>{event ? 'Update Event' : 'Create Event'}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
