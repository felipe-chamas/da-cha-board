import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox-simple'
import { Procedure } from '@/types/taimeline'

interface ProcedureDialogProps {
  procedure: Procedure | null
  onSave: (procedureData: Omit<Procedure, 'id' | 'created_at' | 'updated_at'>) => void
  onClose: () => void
}

export function ProcedureDialog({ procedure, onSave, onClose }: ProcedureDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    color: '#3B82F6',
    is_active: true,
    employee_ids: [] as string[]
  })

  useEffect(() => {
    if (procedure) {
      setFormData({
        name: procedure.name,
        description: procedure.description || '',
        duration_minutes: procedure.duration_minutes,
        price: procedure.price || 0,
        color: procedure.color || '#3B82F6',
        is_active: procedure.is_active,
        employee_ids: procedure.employee_ids || []
      })
    }
  }, [procedure])

  // Removed tag functionality for now - not in current schema

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const colorOptions = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#F97316',
    '#06B6D4',
    '#84CC16',
    '#EC4899',
    '#6B7280'
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{procedure ? 'Edit Procedure' : 'Add New Procedure'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <Label htmlFor='name'>Procedure Name</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder='e.g., Haircut, Massage, Consultation'
                required
              />
            </div>

            <div>
              <Label htmlFor='duration_minutes'>Duration (minutes)</Label>
              <Input
                id='duration_minutes'
                type='number'
                min='15'
                step='15'
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration_minutes: parseInt(e.target.value) }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor='price'>Price (R$)</Label>
              <Input
                id='price'
                type='number'
                min='0'
                step='0.01'
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) }))
                }
                required
              />
            </div>
          </div>

          {/* Employee Assignment Section - simplified for now */}
          <div>
            <Label>Employee Assignment</Label>
            <p className='text-sm text-muted-foreground mt-1'>
              Employee assignment will be handled in the calendar interface
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder='Brief description of the procedure...'
              rows={3}
            />
          </div>

          {/* Color Picker */}
          <div>
            <Label>Calendar Color</Label>
            <div className='flex gap-2 mt-2'>
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type='button'
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          {/* Tags section removed - not in current schema */}

          {/* Active Status */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='is_active'
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked as boolean }))
              }
            />
            <Label htmlFor='is_active'>Active (available for booking)</Label>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-2 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>{procedure ? 'Update Procedure' : 'Create Procedure'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
