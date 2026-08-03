import type { HallStats } from '../utils/hallStats'
import { getUrgency, type Urgency } from '../utils/actionUtils'
import type { MaintenanceAction } from '../model/types'
import { useSettings } from './useSettings'

// Centralizes the showUrgencyIndicators toggle: when it's off, every place
// that visually emphasizes urgency (colors, rings, pulsing, chips) should
// fall back to 'normal' / non-urgent counts instead of checking the setting
// itself in ten different components. The underlying data (deadlines,
// counts) is never hidden — only the visual emphasis is.
export function useUrgencyDisplay() {
  const { settings } = useSettings()
  const enabled = settings.showUrgencyIndicators

  const displayUrgency = (urgency: Urgency): Urgency => (enabled ? urgency : 'normal')

  const urgencyOf = (action: MaintenanceAction | undefined): Urgency => displayUrgency(getUrgency(action))

  const displayStats = (stats: HallStats): HallStats =>
    enabled ? stats : { ...stats, overdueCount: 0, dueSoonCount: 0 }

  return { enabled, displayUrgency, urgencyOf, displayStats }
}
