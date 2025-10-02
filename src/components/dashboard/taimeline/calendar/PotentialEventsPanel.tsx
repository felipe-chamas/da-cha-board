import { PotentialEvent, Employee, Procedure } from '@/types/taimeline'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Phone, User, CheckCircle, XCircle } from 'lucide-react'

interface PotentialEventsPanelProps {
  potentialEvents: PotentialEvent[]
  employees: Employee[]
  procedures: Procedure[]
  onApprove: (eventId: string) => void
  onReject: (eventId: string) => void
  onClose: () => void
}

export function PotentialEventsPanel({
  potentialEvents,
  employees,
  procedures,
  onApprove,
  onReject,
  onClose
}: PotentialEventsPanelProps) {
  const getProcedure = (procedureId: string) => {
    return procedures.find((p) => p.id === procedureId)
  }

  const getEmployee = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_selection':
        return 'bg-yellow-100 text-yellow-800'
      case 'awaiting_approval':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_selection':
        return 'Pending Selection'
      case 'awaiting_approval':
        return 'Awaiting Approval'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Phone className='h-5 w-5' />
            <span>WhatsApp Appointment Requests</span>
            <Badge variant='secondary'>{potentialEvents.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {potentialEvents.length === 0 ? (
            <Card>
              <CardContent className='p-6 text-center'>
                <Phone className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                <p className='text-muted-foreground'>No pending WhatsApp requests</p>
              </CardContent>
            </Card>
          ) : (
            potentialEvents.map((event) => {
              const procedure = getProcedure(event.procedure_id)

              return (
                <Card key={event.id} className='border-l-4 border-l-orange-500'>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div className='space-y-1'>
                        <CardTitle className='flex items-center space-x-2'>
                          <User className='h-4 w-4' />
                          <span>{event.client_name || 'Unknown Client'}</span>
                        </CardTitle>
                        <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                          <div className='flex items-center space-x-1'>
                            <Phone className='h-3 w-3' />
                            <span>{event.client_phone}</span>
                          </div>
                          <div className='flex items-center space-x-1'>
                            <Clock className='h-3 w-3' />
                            <span>{new Date(event.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <Badge className={getStatusColor(event.status)}>
                        {getStatusText(event.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-4'>
                    {/* Procedure info */}
                    {procedure && (
                      <div className='p-3 bg-muted/50 rounded-lg'>
                        <div className='font-medium'>{procedure.name}</div>
                        <div className='text-sm text-muted-foreground'>
                          Duration: {procedure.duration_minutes} minutes
                          {procedure.price && ` • Price: $${procedure.price}`}
                        </div>
                      </div>
                    )}

                    {/* Requested time */}
                    {(event.requested_date || event.requested_time) && (
                      <div className='p-3 bg-muted/50 rounded-lg'>
                        <div className='text-sm font-medium mb-1'>Requested Time:</div>
                        <div className='text-sm'>
                          {event.requested_date &&
                            new Date(event.requested_date).toLocaleDateString()}
                          {event.requested_time && ` at ${event.requested_time}`}
                        </div>
                      </div>
                    )}

                    {/* Available slots */}
                    {event.available_slots.length > 0 && (
                      <div>
                        <div className='text-sm font-medium mb-2'>Available Time Slots:</div>
                        <div className='space-y-2'>
                          {event.available_slots.map((slot, index) => {
                            const employee = getEmployee(slot.employee_id)
                            const startTime = new Date(slot.start_datetime)
                            const endTime = new Date(slot.end_datetime)

                            return (
                              <div
                                key={index}
                                className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50'
                              >
                                <div className='flex items-center space-x-3'>
                                  {employee && (
                                    <Avatar className='h-8 w-8'>
                                      <AvatarImage src={employee.avatar_url} />
                                      <AvatarFallback>
                                        {employee.name
                                          .split(' ')
                                          .map((n) => n[0])
                                          .join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div>
                                    <div className='font-medium'>
                                      {employee?.name || 'Unknown Employee'}
                                    </div>
                                    <div className='text-sm text-muted-foreground'>
                                      {startTime.toLocaleDateString()} •{' '}
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
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {event.status === 'awaiting_approval' && (
                      <div className='flex space-x-2 pt-4 border-t'>
                        <Button
                          size='sm'
                          onClick={() => onApprove(event.id)}
                          className='flex items-center space-x-1'
                        >
                          <CheckCircle className='h-4 w-4' />
                          <span>Approve</span>
                        </Button>

                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => onReject(event.id)}
                          className='flex items-center space-x-1'
                        >
                          <XCircle className='h-4 w-4' />
                          <span>Reject</span>
                        </Button>
                      </div>
                    )}

                    {event.status === 'pending_selection' && (
                      <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                        <div className='text-sm text-blue-800'>
                          ⏳ Waiting for client to select a time slot via WhatsApp
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        <div className='flex justify-end pt-4 border-t'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
