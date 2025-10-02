'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GeneratedProject } from '@/types/business'

interface ProjectGeneratorProps {
  onGenerate: (project: Omit<GeneratedProject, 'id' | 'created_at' | 'updated_at'>) => void
}

export function ProjectGenerator({ onGenerate }: ProjectGeneratorProps) {
  const [formData, setFormData] = useState({
    business_name: '',
    owner_email: '',
    brand_colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#0066cc'
    },
    logo_url: '',
    enabled_services: [] as ('taimeline' | 'derlivery')[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate({
      ...formData,
      generation_status: 'pending' as const
    })
  }

  const toggleService = (service: 'taimeline' | 'derlivery') => {
    setFormData((prev) => ({
      ...prev,
      enabled_services: prev.enabled_services.includes(service)
        ? prev.enabled_services.filter((s) => s !== service)
        : [...prev.enabled_services, service]
    }))
  }

  return (
    <Card className='max-w-2xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Plus className='h-5 w-5' />
          Generate New Dashboard
        </CardTitle>
        <CardDescription>Create a customized dashboard repository for a business</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid gap-4'>
            <div>
              <label className='text-sm font-medium'>Business Name</label>
              <Input
                value={formData.business_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, business_name: e.target.value }))
                }
                placeholder='Acme Corp'
                required
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Owner Email</label>
              <Input
                type='email'
                value={formData.owner_email}
                onChange={(e) => setFormData((prev) => ({ ...prev, owner_email: e.target.value }))}
                placeholder='owner@acmecorp.com'
                required
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Logo URL (optional)</label>
              <Input
                type='url'
                value={formData.logo_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
                placeholder='https://example.com/logo.png'
              />
            </div>
          </div>

          <div>
            <label className='text-sm font-medium mb-3 block'>Brand Colors</label>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <label className='text-xs text-muted-foreground'>Primary</label>
                <Input
                  type='color'
                  value={formData.brand_colors.primary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      brand_colors: { ...prev.brand_colors, primary: e.target.value }
                    }))
                  }
                />
              </div>
              <div>
                <label className='text-xs text-muted-foreground'>Secondary</label>
                <Input
                  type='color'
                  value={formData.brand_colors.secondary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      brand_colors: { ...prev.brand_colors, secondary: e.target.value }
                    }))
                  }
                />
              </div>
              <div>
                <label className='text-xs text-muted-foreground'>Accent</label>
                <Input
                  type='color'
                  value={formData.brand_colors.accent}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      brand_colors: { ...prev.brand_colors, accent: e.target.value }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className='text-sm font-medium mb-3 block'>Enabled Services</label>
            <div className='flex gap-4'>
              <Button
                type='button'
                variant={formData.enabled_services.includes('taimeline') ? 'default' : 'outline'}
                onClick={() => toggleService('taimeline')}
              >
                Taimeline
              </Button>
              <Button
                type='button'
                variant={formData.enabled_services.includes('derlivery') ? 'default' : 'outline'}
                onClick={() => toggleService('derlivery')}
              >
                Derlivery
              </Button>
            </div>
          </div>

          <Button type='submit' className='w-full'>
            Generate Dashboard Repository
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
