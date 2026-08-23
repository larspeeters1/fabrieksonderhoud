import type { HallStats } from '../utils/hallStats'
import { getUrgency, type Urgency } from '../utils/actionUtils'
import type { MaintenanceAction } from '../model/types'
import { useSettings } from './useSettings'


export function useUrgencyDisplay() {
  const { settings } = useSettings()
  const enabled = settings.showUrgencyIndicators

  const displayUrgency = (urgency: Urgency | undefined): Urgency | undefined =>
    enabled || !urgency || urgency === 'open' || urgency === 'done' ? urgency : 'open'

  const urgencyOf = (action: MaintenanceAction | undefined): Urgency | undefined =>
    displayUrgency(getUrgency(action))

  const displayStats = (stats: HallStats): HallStats =>
    enabled ? stats : { ...stats, overdueCount: 0, dueSoonCount: 0 }

  return { enabled, displayUrgency, urgencyOf, displayStats }
}
