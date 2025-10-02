import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Employee, Procedure, WorkSchedule, TimeSlot } from '@/types/taimeline'
import { Clock, Plus, Trash2, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeSlotManagerProps {
  employees: Employee[]
  procedures: Procedure[]
  onEmployeeUpdate: (employeeId: string, workSchedule: WorkSchedule) => void
  onClose: () => void
}

interface TimeSlotBlock {
  id: string
  procedureId: string
  procedureName: string
  duration: number
  color: string
  startTime: string
}

interface DaySchedule {
  day: keyof WorkSchedule
  displayName: string
  blocks: TimeSlotBlock[]
}

// Generate 15-minute time slots from 6 AM to 10 PM
const generateTimeSlots = (): string[] => {
  const slots = []
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

function SortableTimeSlot({
  block,
  isOverlay = false
}: {
  block: TimeSlotBlock
  isOverlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn('cursor-move', isDragging && 'opacity-50', isOverlay && 'rotate-3 shadow-lg')}
    >
      <Card className={cn('border-l-4 mb-2', block.color)}>
        <CardContent className='p-3'>
          <div className='flex justify-between items-center'>
            <div>
              <div className='font-medium text-sm'>{block.procedureName}</div>
              <div className='text-xs text-muted-foreground'>
                {block.startTime} ({block.duration}min)
              </div>
            </div>
            <Badge variant='secondary' className='text-xs'>
              {block.startTime}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function TimeSlotManager({
  employees,
  procedures,
  onEmployeeUpdate,
  onClose
}: TimeSlotManagerProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    employees.length > 0 ? employees[0] : null
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([])

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeSchedule(selectedEmployee)
    }
  }, [selectedEmployee])

  const loadEmployeeSchedule = (employee: Employee) => {
    const days: (keyof WorkSchedule)[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ]
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    const schedules = days.map((day, index) => ({
      day,
      displayName: dayNames[index],
      blocks: convertTimeSlotsToBlocks(employee.work_schedule[day] || [])
    }))

    setDaySchedules(schedules)
  }

  const convertTimeSlotsToBlocks = (timeSlots: TimeSlot[]): TimeSlotBlock[] => {
    const blocks: TimeSlotBlock[] = []

    timeSlots.forEach((slot, index) => {
      // For now, create generic work blocks - later we can assign procedures
      blocks.push({
        id: `block-${Date.now()}-${index}`,
        procedureId: 'generic',
        procedureName: 'Available Time',
        duration: calculateDuration(slot.start, slot.end),
        color: 'border-l-green-500 bg-green-50',
        startTime: slot.start
      })
    })

    return blocks
  }

  const calculateDuration = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)
    return endHour * 60 + endMin - (startHour * 60 + startMin)
  }

  const addProcedureBlock = (dayIndex: number, procedureId: string, startTime: string) => {
    const procedure = procedures.find((p) => p.id === procedureId)
    if (!procedure) return

    const newBlock: TimeSlotBlock = {
      id: `block-${Date.now()}`,
      procedureId: procedure.id,
      procedureName: procedure.name,
      duration: procedure.duration_minutes,
      color: procedure.color || 'border-l-blue-500 bg-blue-50',
      startTime
    }

    setDaySchedules((prev) =>
      prev.map((schedule, index) =>
        index === dayIndex
          ? {
              ...schedule,
              blocks: [...schedule.blocks, newBlock].sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
              )
            }
          : schedule
      )
    )
  }

  const removeBlock = (dayIndex: number, blockId: string) => {
    setDaySchedules((prev) =>
      prev.map((schedule, index) =>
        index === dayIndex
          ? { ...schedule, blocks: schedule.blocks.filter((block) => block.id !== blockId) }
          : schedule
      )
    )
  }

  const copyDaySchedule = (fromDayIndex: number, toDayIndex: number) => {
    const sourceSchedule = daySchedules[fromDayIndex]
    const copiedBlocks = sourceSchedule.blocks.map((block) => ({
      ...block,
      id: `block-${Date.now()}-${Math.random()}`
    }))

    setDaySchedules((prev) =>
      prev.map((schedule, index) =>
        index === toDayIndex ? { ...schedule, blocks: copiedBlocks } : schedule
      )
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    // Handle drag and drop logic here
    // This is a simplified version - you'd implement more complex logic for different drop zones
    console.log('Drag ended:', { active: active.id, over: over.id })
  }

  const saveSchedule = () => {
    if (!selectedEmployee) return

    // Convert blocks back to TimeSlot format
    const newWorkSchedule: WorkSchedule = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }

    daySchedules.forEach((daySchedule) => {
      // Group consecutive blocks into time slots
      const sortedBlocks = daySchedule.blocks.sort((a, b) => a.startTime.localeCompare(b.startTime))

      if (sortedBlocks.length > 0) {
        let currentStart = sortedBlocks[0].startTime
        let currentEnd = addMinutesToTime(sortedBlocks[0].startTime, sortedBlocks[0].duration)

        for (let i = 1; i < sortedBlocks.length; i++) {
          const block = sortedBlocks[i]
          const blockEnd = addMinutesToTime(block.startTime, block.duration)

          // If blocks are consecutive, extend the current slot
          if (block.startTime === currentEnd) {
            currentEnd = blockEnd
          } else {
            // Save the current slot and start a new one
            newWorkSchedule[daySchedule.day].push({
              start: currentStart,
              end: currentEnd
            })
            currentStart = block.startTime
            currentEnd = blockEnd
          }
        }

        // Save the final slot
        newWorkSchedule[daySchedule.day].push({
          start: currentStart,
          end: currentEnd
        })
      }
    })

    onEmployeeUpdate(selectedEmployee.id, newWorkSchedule)
    onClose()
  }

  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hour, min] = time.split(':').map(Number)
    const totalMinutes = hour * 60 + min + minutes
    const newHour = Math.floor(totalMinutes / 60)
    const newMin = totalMinutes % 60
    return `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`
  }

  const activeBlock = activeId
    ? daySchedules.flatMap((d) => d.blocks).find((b) => b.id === activeId)
    : null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-6xl max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Clock className='h-5 w-5' />
            <span>Time Slot Manager</span>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Employee Selection */}
          <div className='flex items-center space-x-4'>
            <div className='flex-1'>
              <Select
                value={selectedEmployee?.id || ''}
                onValueChange={(value: string) => {
                  const employee = employees.find((e) => e.id === value)
                  setSelectedEmployee(employee || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select employee' />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEmployee && (
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className='grid grid-cols-7 gap-4'>
                {daySchedules.map((daySchedule, dayIndex) => (
                  <Card key={daySchedule.day} className='min-h-[400px]'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm flex justify-between items-center'>
                        <span>{daySchedule.displayName}</span>
                        <div className='flex space-x-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              const fromDay = prompt('Copy from which day? (0=Mon, 1=Tue, etc.)')
                              if (fromDay !== null) {
                                const fromIndex = parseInt(fromDay)
                                if (fromIndex >= 0 && fromIndex < 7) {
                                  copyDaySchedule(fromIndex, dayIndex)
                                }
                              }
                            }}
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                      {/* Add procedure block */}
                      <div className='flex space-x-2'>
                        <Select
                          onValueChange={(procedureId: string) => {
                            const startTime = prompt('Start time (HH:MM):')
                            if (startTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
                              addProcedureBlock(dayIndex, procedureId, startTime)
                            }
                          }}
                        >
                          <SelectTrigger className='text-xs'>
                            <SelectValue placeholder='Add procedure' />
                          </SelectTrigger>
                          <SelectContent>
                            {procedures
                              .filter((p) => p.is_active)
                              .map((procedure) => (
                                <SelectItem key={procedure.id} value={procedure.id}>
                                  {procedure.name} ({procedure.duration_minutes}min)
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Time blocks */}
                      <SortableContext
                        items={daySchedule.blocks.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {daySchedule.blocks.map((block) => (
                          <div key={block.id} className='relative group'>
                            <SortableTimeSlot block={block} />
                            <Button
                              variant='ghost'
                              size='sm'
                              className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0'
                              onClick={() => removeBlock(dayIndex, block.id)}
                            >
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        ))}
                      </SortableContext>

                      {daySchedule.blocks.length === 0 && (
                        <div className='text-center text-muted-foreground text-xs py-8'>
                          No time blocks scheduled
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <DragOverlay>
                {activeBlock && <SortableTimeSlot block={activeBlock} isOverlay />}
              </DragOverlay>
            </DndContext>
          )}

          {/* Action buttons */}
          <div className='flex justify-end space-x-2 pt-4 border-t'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={saveSchedule}>Save Schedule</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
