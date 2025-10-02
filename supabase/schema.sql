-- Create generated_projects table (tracks each business dashboard generated)
create table generated_projects (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  owner_email text not null,
  brand_colors jsonb default '{"primary": "#000000", "secondary": "#666666", "accent": "#0066cc"}',
  logo_url text,
  enabled_services text [] default array []::text [],
  gitea_repo_url text,
  supabase_project_url text,
  generation_status text not null check (
    generation_status in ('pending', 'generating', 'completed', 'failed')
  ) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create project_templates table (reusable dashboard templates)
create table project_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  services text [] default array []::text [],
  template_files jsonb default '[]',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create generation_config table (platform settings)
create table generation_config (
  id uuid default gen_random_uuid() primary key,
  gitea_base_url text not null,
  gitea_token text not null,
  supabase_api_key text,
  default_template_id uuid references project_templates(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable RLS (admin-only access for now)
alter table generated_projects enable row level security;
alter table project_templates enable row level security;
alter table generation_config enable row level security;
-- Admin-only policies (you control who generates dashboards)
create policy "Admin can manage projects" on generated_projects for all using (
  auth.uid() = (
    select id
    from auth.users
    where email = 'your-admin@email.com'
  )
);
create policy "Admin can manage templates" on project_templates for all using (
  auth.uid() = (
    select id
    from auth.users
    where email = 'your-admin@email.com'
  )
);
create policy "Admin can manage config" on generation_config for all using (
  auth.uid() = (
    select id
    from auth.users
    where email = 'your-admin@email.com'
  )
);
-- TAIMELINE SERVICE TABLES
-- Employees table
create table employees (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references generated_projects(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  role text not null,
  is_active boolean default true,
  work_schedule jsonb default '{
    "monday": [],
    "tuesday": [],
    "wednesday": [],
    "thursday": [],
    "friday": [],
    "saturday": [],
    "sunday": []
  }',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Procedures table
create table procedures (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references generated_projects(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null,
  price decimal(10, 2),
  color text default '#3b82f6',
  is_active boolean default true,
  employee_ids uuid [] default array []::uuid [],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Calendar events table
create table calendar_events (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references generated_projects(id) on delete cascade,
  title text not null,
  description text,
  start_datetime timestamp with time zone not null,
  end_datetime timestamp with time zone not null,
  procedure_id uuid references procedures(id) on delete
  set null,
    employee_id uuid references employees(id) on delete cascade,
    client_name text,
    client_phone text,
    client_email text,
    status text not null check (
      status in ('confirmed', 'pending', 'cancelled', 'completed')
    ) default 'confirmed',
    source text not null check (
      source in ('admin', 'whatsapp', 'google_calendar', 'manual')
    ) default 'admin',
    google_calendar_event_id text,
    whatsapp_message_id text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Potential events (from WhatsApp bot)
create table potential_events (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references generated_projects(id) on delete cascade,
  client_phone text not null,
  client_name text,
  procedure_id uuid references procedures(id) on delete cascade,
  requested_date date,
  requested_time time,
  available_slots jsonb default '[]',
  status text not null check (
    status in (
      'pending_selection',
      'awaiting_approval',
      'approved',
      'rejected',
      'expired'
    )
  ) default 'pending_selection',
  whatsapp_conversation_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Google Calendar integration
create table google_calendar_integrations (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references generated_projects(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  google_calendar_id text not null,
  access_token text not null,
  refresh_token text not null,
  is_active boolean default true,
  sync_direction text not null check (
    sync_direction in ('both', 'from_google', 'to_google')
  ) default 'both',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- WhatsApp integration
create table whatsapp_integrations (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references generated_projects(id) on delete cascade,
  business_phone text not null,
  webhook_url text not null,
  access_token text not null,
  is_active boolean default true,
  bot_settings jsonb default '{
    "welcome_message": "Hello! How can I help you schedule an appointment?",
    "instructions": "Please tell me what service you need and your preferred date/time.",
    "business_hours": {
      "monday": [{"start": "09:00", "end": "17:00"}],
      "tuesday": [{"start": "09:00", "end": "17:00"}],
      "wednesday": [{"start": "09:00", "end": "17:00"}],
      "thursday": [{"start": "09:00", "end": "17:00"}],
      "friday": [{"start": "09:00", "end": "17:00"}],
      "saturday": [],
      "sunday": []
    }
  }',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable RLS on Taimeline tables
alter table employees enable row level security;
alter table procedures enable row level security;
alter table calendar_events enable row level security;
alter table potential_events enable row level security;
alter table google_calendar_integrations enable row level security;
alter table whatsapp_integrations enable row level security;
-- RLS Policies for business owners to access their own data
-- (In generated dashboards, each business will have their own auth system)
create policy "Business can manage employees" on employees for all using (
  business_id in (
    select id
    from generated_projects
    where owner_email = (
        select email
        from auth.users
        where id = auth.uid()
      )
  )
);
create policy "Business can manage procedures" on procedures for all using (
  business_id in (
    select id
    from generated_projects
    where owner_email = (
        select email
        from auth.users
        where id = auth.uid()
      )
  )
);
create policy "Business can manage events" on calendar_events for all using (
  business_id in (
    select id
    from generated_projects
    where owner_email = (
        select email
        from auth.users
        where id = auth.uid()
      )
  )
);
create policy "Business can manage potential events" on potential_events for all using (
  business_id in (
    select id
    from generated_projects
    where owner_email = (
        select email
        from auth.users
        where id = auth.uid()
      )
  )
);
create policy "Business can manage google integration" on google_calendar_integrations for all using (
  business_id in (
    select id
    from generated_projects
    where owner_email = (
        select email
        from auth.users
        where id = auth.uid()
      )
  )
);
create policy "Business can manage whatsapp integration" on whatsapp_integrations for all using (
  business_id in (
    select id
    from generated_projects
    where owner_email = (
        select email
        from auth.users
        where id = auth.uid()
      )
  )
);
-- Indexes for better performance
create index idx_employees_business_id on employees(business_id);
create index idx_procedures_business_id on procedures(business_id);
create index idx_calendar_events_business_id on calendar_events(business_id);
create index idx_calendar_events_employee_id on calendar_events(employee_id);
create index idx_calendar_events_date_range on calendar_events(start_datetime, end_datetime);
create index idx_potential_events_business_id on potential_events(business_id);
create index idx_potential_events_status on potential_events(status);