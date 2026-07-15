import type { Device, MaintenanceAction } from '../model/types'
import { isOverdue, isWithin24h } from './dateUtils'

export type Urgency = 'overdue' | 'dueSoon' | 'normal'

const URGENCY_RANK: Record<Urgency, number> = { overdue: 0, dueSoon: 1, normal: 2 }

export function getNextOpenAction(
  deviceId: string,
  actions: MaintenanceAction[],
): MaintenanceAction | undefined {
  return actions
    .filter((action) => action.deviceId === deviceId && action.status === 'open')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))[0]
}

export function getUrgency(action: MaintenanceAction | undefined): Urgency {
  // Only open actions can be "urgent" — an executed action's deadline may
  // well be in the past, but it no longer needs anything to happen.
  if (!action || action.status !== 'open') return 'normal'
  if (isOverdue(action.deadline)) return 'overdue'
  if (isWithin24h(action.deadline)) return 'dueSoon'
  return 'normal'
}

// Splits one device's actions into the three buckets the detail page shows:
// the single most urgent open action, the remaining open actions, and the
// already-executed ones. `actions` is expected to already be scoped to a
// single device (see useDeviceActions), so no deviceId filtering happens here.
export function splitDeviceActions(actions: MaintenanceAction[]): {
  nextAction: MaintenanceAction | undefined
  otherOpenActions: MaintenanceAction[]
  executedActions: MaintenanceAction[]
} {
  const openActions = actions
    .filter((action) => action.status === 'open')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
  const executedActions = actions
    .filter((action) => action.status === 'uitgevoerd')
    .sort((a, b) => (b.executedAt ?? '').localeCompare(a.executedAt ?? ''))

  return {
    nextAction: openActions[0],
    otherOpenActions: openActions.slice(1),
    executedActions,
  }
}

export function sortDevicesByUrgency(devices: Device[], actions: MaintenanceAction[]): Device[] {
  return [...devices].sort((a, b) => {
    const actionA = getNextOpenAction(a.id, actions)
    const actionB = getNextOpenAction(b.id, actions)
    const rankA = actionA ? URGENCY_RANK[getUrgency(actionA)] : 3
    const rankB = actionB ? URGENCY_RANK[getUrgency(actionB)] : 3
    if (rankA !== rankB) return rankA - rankB
    if (actionA && actionB) return actionA.deadline.localeCompare(actionB.deadline)
    return 0
  })
}
