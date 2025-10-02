'use client'

import { useState } from 'react'
import { Calendar, Package, Settings, Users } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  businessName: string
  enabledServices: ('taimeline' | 'derlivery')[]
  brandColors: {
    primary: string
    secondary: string
    accent: string
  }
}

const serviceIcons = {
  taimeline: Calendar,
  derlivery: Package
}

const serviceLabels = {
  taimeline: 'Taimeline',
  derlivery: 'Derlivery'
}

export function DashboardLayout({
  children,
  businessName,
  enabledServices,
  brandColors
}: DashboardLayoutProps) {
  const [activeService, setActiveService] = useState<string>('dashboard')

  return (
    <SidebarProvider>
      <div className='flex h-screen w-full'>
        <Sidebar>
          <SidebarContent>
            <div className='p-4'>
              <h2 className='text-lg font-semibold' style={{ color: brandColors.primary }}>
                {businessName}
              </h2>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveService('dashboard')}
                      isActive={activeService === 'dashboard'}
                    >
                      <Settings className='h-4 w-4' />
                      Dashboard
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveService('users')}
                      isActive={activeService === 'users'}
                    >
                      <Users className='h-4 w-4' />
                      Users
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Services</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {enabledServices.map((service) => {
                    const Icon = serviceIcons[service]
                    return (
                      <SidebarMenuItem key={service}>
                        <SidebarMenuButton
                          onClick={() => setActiveService(service)}
                          isActive={activeService === service}
                        >
                          <Icon className='h-4 w-4' />
                          {serviceLabels[service]}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className='flex-1 overflow-auto'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <SidebarTrigger />
              <h1 className='text-2xl font-bold capitalize'>{activeService}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
