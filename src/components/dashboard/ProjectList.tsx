import { GeneratedProject } from '@/types/business'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, GitBranch, Globe, User } from 'lucide-react'

interface ProjectListProps {
  projects: GeneratedProject[]
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  generating: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center h-32'>
          <p className='text-muted-foreground'>No projects generated yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  {project.business_name}
                  <Badge variant='secondary' className={statusColors[project.generation_status]}>
                    {project.generation_status}
                  </Badge>
                </CardTitle>
                <CardDescription className='flex items-center gap-1 mt-1'>
                  <User className='h-3 w-3' />
                  {project.owner_email}
                </CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <div
                  className='w-4 h-4 rounded-full border'
                  style={{ backgroundColor: project.brand_colors.primary }}
                  title='Primary color'
                />
                <div
                  className='w-4 h-4 rounded-full border'
                  style={{ backgroundColor: project.brand_colors.secondary }}
                  title='Secondary color'
                />
                <div
                  className='w-4 h-4 rounded-full border'
                  style={{ backgroundColor: project.brand_colors.accent }}
                  title='Accent color'
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='flex gap-2'>
                {project.enabled_services.map((service) => (
                  <Badge key={service} variant='outline'>
                    {service}
                  </Badge>
                ))}
              </div>
              <div className='flex gap-2'>
                {project.gitea_repo_url && (
                  <a
                    href={project.gitea_repo_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
                  >
                    <GitBranch className='h-3 w-3' />
                    Repo
                    <ExternalLink className='h-3 w-3' />
                  </a>
                )}
                {project.supabase_project_url && (
                  <a
                    href={project.supabase_project_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
                  >
                    <Globe className='h-3 w-3' />
                    Database
                    <ExternalLink className='h-3 w-3' />
                  </a>
                )}
              </div>
            </div>
            <p className='text-xs text-muted-foreground mt-2'>
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
