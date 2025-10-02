import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { Settings, Clock, MessageSquare, Calendar, Users } from 'lucide-react'

interface CalendarSettingsProps {
  businessId: string
  onClose: () => void
}

export function CalendarSettings({ businessId, onClose }: CalendarSettingsProps) {
  const [settings, setSettings] = useState({
    // Calendar settings
    default_view: 'week',
    time_slot_duration: 30,
    business_hours_start: '09:00',
    business_hours_end: '17:00',
    timezone: 'America/New_York',

    // Google Calendar integration
    google_calendar_enabled: false,
    google_calendar_sync_direction: 'both',

    // WhatsApp integration
    whatsapp_enabled: false,
    whatsapp_business_phone: '',
    whatsapp_webhook_url: '',
    whatsapp_welcome_message: 'Hello! How can I help you schedule an appointment?',

    // Notifications
    email_notifications: true,
    sms_notifications: false,
    reminder_hours: 24
  })

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save settings
      console.log('Saving settings:', settings)
      onClose()
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Settings className='h-5 w-5' />
            <span>Calendar Settings</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue='general' className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='integrations'>Integrations</TabsTrigger>
            <TabsTrigger value='notifications'>Notifications</TabsTrigger>
            <TabsTrigger value='employees'>Employees</TabsTrigger>
          </TabsList>

          <TabsContent value='general' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Calendar className='h-4 w-4' />
                  <span>Calendar Display</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='default_view'>Default View</Label>
                    <Select
                      value={settings.default_view}
                      onValueChange={(value: string) =>
                        setSettings((prev) => ({ ...prev, default_view: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='month'>Month</SelectItem>
                        <SelectItem value='week'>Week</SelectItem>
                        <SelectItem value='day'>Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='time_slot_duration'>Time Slot Duration (minutes)</Label>
                    <Select
                      value={settings.time_slot_duration.toString()}
                      onValueChange={(value: string) =>
                        setSettings((prev) => ({ ...prev, time_slot_duration: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='15'>15 minutes</SelectItem>
                        <SelectItem value='30'>30 minutes</SelectItem>
                        <SelectItem value='60'>1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='business_hours_start'>Business Hours Start</Label>
                    <Input
                      id='business_hours_start'
                      type='time'
                      value={settings.business_hours_start}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, business_hours_start: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor='business_hours_end'>Business Hours End</Label>
                    <Input
                      id='business_hours_end'
                      type='time'
                      value={settings.business_hours_end}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, business_hours_end: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor='timezone'>Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value: string) =>
                      setSettings((prev) => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='America/New_York'>Eastern Time</SelectItem>
                      <SelectItem value='America/Chicago'>Central Time</SelectItem>
                      <SelectItem value='America/Denver'>Mountain Time</SelectItem>
                      <SelectItem value='America/Los_Angeles'>Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='integrations' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Calendar className='h-4 w-4' />
                  <span>Google Calendar Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label>Enable Google Calendar Sync</Label>
                    <p className='text-sm text-muted-foreground'>
                      Sync events with Google Calendar
                    </p>
                  </div>
                  <Switch
                    checked={settings.google_calendar_enabled}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({ ...prev, google_calendar_enabled: checked }))
                    }
                  />
                </div>

                {settings.google_calendar_enabled && (
                  <div>
                    <Label>Sync Direction</Label>
                    <Select
                      value={settings.google_calendar_sync_direction}
                      onValueChange={(value: string) =>
                        setSettings((prev) => ({ ...prev, google_calendar_sync_direction: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='both'>Both Ways</SelectItem>
                        <SelectItem value='from_google'>From Google Calendar Only</SelectItem>
                        <SelectItem value='to_google'>To Google Calendar Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <MessageSquare className='h-4 w-4' />
                  <span>WhatsApp Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label>Enable WhatsApp Bot</Label>
                    <p className='text-sm text-muted-foreground'>
                      Allow clients to book appointments via WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={settings.whatsapp_enabled}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({ ...prev, whatsapp_enabled: checked }))
                    }
                  />
                </div>

                {settings.whatsapp_enabled && (
                  <>
                    <div>
                      <Label htmlFor='whatsapp_business_phone'>Business WhatsApp Number</Label>
                      <Input
                        id='whatsapp_business_phone'
                        value={settings.whatsapp_business_phone}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            whatsapp_business_phone: e.target.value
                          }))
                        }
                        placeholder='+1 (555) 123-4567'
                      />
                    </div>

                    <div>
                      <Label htmlFor='whatsapp_webhook_url'>Webhook URL</Label>
                      <Input
                        id='whatsapp_webhook_url'
                        value={settings.whatsapp_webhook_url}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, whatsapp_webhook_url: e.target.value }))
                        }
                        placeholder='https://your-domain.com/api/whatsapp/webhook'
                      />
                    </div>

                    <div>
                      <Label htmlFor='whatsapp_welcome_message'>Welcome Message</Label>
                      <Input
                        id='whatsapp_welcome_message'
                        value={settings.whatsapp_welcome_message}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            whatsapp_welcome_message: e.target.value
                          }))
                        }
                        placeholder='Hello! How can I help you schedule an appointment?'
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='notifications' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Clock className='h-4 w-4' />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label>Email Notifications</Label>
                    <p className='text-sm text-muted-foreground'>
                      Send email notifications for new appointments
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className='text-sm text-muted-foreground'>
                      Send SMS notifications for appointments
                    </p>
                  </div>
                  <Switch
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({ ...prev, sms_notifications: checked }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor='reminder_hours'>Reminder Time (hours before appointment)</Label>
                  <Select
                    value={settings.reminder_hours.toString()}
                    onValueChange={(value: string) =>
                      setSettings((prev) => ({ ...prev, reminder_hours: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>1 hour</SelectItem>
                      <SelectItem value='2'>2 hours</SelectItem>
                      <SelectItem value='24'>24 hours</SelectItem>
                      <SelectItem value='48'>48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='employees' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Users className='h-4 w-4' />
                  <span>Employee Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground mb-4'>
                  Manage employee schedules, permissions, and service assignments.
                </p>
                <Button>Manage Employees</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className='flex justify-end space-x-2 pt-4 border-t'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
