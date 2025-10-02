import { TaimelineCalendar } from './taimeline/TaimelineCalendar'

export function TaimelineService() {
  // In a real app, this would come from props or context
  const businessId = 'demo-business-id'

  return <TaimelineCalendar businessId={businessId} />
}
