// Core business types
export interface GeneratedProject {
  id: string
  business_name: string
  owner_email: string
  brand_colors: {
    primary: string
    secondary: string
    accent: string
  }
  logo_url?: string
  enabled_services: ('taimeline' | 'derlivery')[]
  gitea_repo_url?: string
  supabase_project_url?: string
  generation_status: 'pending' | 'generating' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  services: ('taimeline' | 'derlivery')[]
  template_files: string[]
  is_active: boolean
}

export interface GenerationConfig {
  gitea_base_url: string
  gitea_token: string
  supabase_api_key?: string
  default_template_id: string
}
