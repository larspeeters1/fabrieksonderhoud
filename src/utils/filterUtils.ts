import type { HallFilters } from '../model/filters'
import type { Device, MaintenanceAction } from '../model/types'
import { isDeadlineWithinDays, isOverdue, isWithin24h } from './dateUtils'

export function actionMatchesFilters(action: MaintenanceAction, filters: HallFilters): boolean {
  if (filters.actionType && action.type !== filters.actionType) return false
  if (filters.status && action.status !== filters.status) return false
  if (!isDeadlineWithinDays(action.deadline, filters.timeWindow)) return false
  if (filters.highUrgencyOnly) {
    // "Hoge urgentie" only makes sense for actions that still need to
    // happen; an executed action isn't urgent even if its deadline (now in
    // the past) would otherwise look overdue.
    const isUrgent = action.status === 'open' && (isOverdue(action.deadline) || isWithin24h(action.deadline))
    if (!isUrgent) return false
  }
  return true
}

export function getMatchingActions(
  deviceId: string,
  actions: MaintenanceAction[],
  filters: HallFilters,
): MaintenanceAction[] {
  return actions
    .filter((action) => action.deviceId === deviceId && actionMatchesFilters(action, filters))
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
}

export function getNextMatchingAction(
  deviceId: string,
  actions: MaintenanceAction[],
  filters: HallFilters,
): MaintenanceAction | undefined {
  return getMatchingActions(deviceId, actions, filters)[0]
}

// US5's inspection round only ever walks actions that still need to happen —
// "de eerstvolgende open actie die aan de actieve filters voldoet" — whereas
// getNextMatchingAction above deliberately includes executed actions too (it
// backs the hall detail chips, which show what an action *was* even once
// done). Kept as a separate function rather than a parameter so neither
// caller has to reason about a flag it doesn't need.
export function getNextOpenMatchingAction(
  deviceId: string,
  actions: MaintenanceAction[],
  filters: HallFilters,
): MaintenanceAction | undefined {
  return getMatchingActions(deviceId, actions, filters).find((action) => action.status === 'open')
}

function matchesSearch(device: Device, search: string): boolean {
  const term = search.trim().toLowerCase()
  if (!term) return true
  return device.name.toLowerCase().includes(term) || (device.description?.toLowerCase().includes(term) ?? false)
}

export function deviceMatchesFilters(device: Device, actions: MaintenanceAction[], filters: HallFilters): boolean {
  if (filters.category && device.category !== filters.category) return false
  if (!matchesSearch(device, filters.search)) return false

  const deviceActions = actions.filter((action) => action.deviceId === device.id)
  if (deviceActions.some((action) => actionMatchesFilters(action, filters))) return true

  // A device without any actions at all can never produce a "matching
  // action", which would permanently hide it even while just browsing with
  // no action-related filter engaged. Keep such devices visible as long as
  // actionType/status/highUrgencyOnly are untouched; the moment the user
  // engages one of those, "no actions" means the device has nothing to
  // offer for that filter, so it drops out. Kept deliberately simple.
  const noActionFilterActive = !filters.actionType && !filters.status && !filters.highUrgencyOnly
  return deviceActions.length === 0 && noActionFilterActive
}

export function filterHallDevices(devices: Device[], actions: MaintenanceAction[], filters: HallFilters): Device[] {
  return devices.filter((device) => deviceMatchesFilters(device, actions, filters))
}

export function countMatchingActions(devices: Device[], actions: MaintenanceAction[], filters: HallFilters): number {
  return devices.reduce((total, device) => total + getMatchingActions(device.id, actions, filters).length, 0)
}
