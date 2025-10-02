'use client'

import { useState } from 'react'
import { ProjectGenerator } from '@/components/dashboard/ProjectGenerator'
import { ProjectList } from '@/components/dashboard/ProjectList'
import { GeneratedProject } from '@/types/business'

export default function Home() {
  const [projects, setProjects] = useState<GeneratedProject[]>([])

  const handleGenerate = (
    projectData: Omit<GeneratedProject, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const newProject: GeneratedProject = {
      ...projectData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setProjects((prev) => [newProject, ...prev])

    // TODO: Implement actual generation logic
    console.log('Generating dashboard for:', newProject)
  }

  return (
    <div className='container mx-auto p-6 space-y-8'>
      <header className='text-center space-y-2'>
        <h1 className='text-4xl font-bold'>Da-Cha-Board Generator</h1>
        <p className='text-muted-foreground'>
          Create customized dashboard repositories for small businesses
        </p>
      </header>

      <div className='grid lg:grid-cols-2 gap-8'>
        <div>
          <ProjectGenerator onGenerate={handleGenerate} />
        </div>

        <div className='space-y-4'>
          <h2 className='text-2xl font-semibold'>Generated Projects</h2>
          <ProjectList projects={projects} />
        </div>
      </div>
    </div>
  )
}
