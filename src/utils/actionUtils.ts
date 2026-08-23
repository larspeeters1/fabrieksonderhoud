import type { Device, MaintenanceAction } from '../model/types'
import { isOverdue, isWithin24h } from './dateUtils'

export type Urgency = 'overdue' | 'dueSoon' | 'open' | 'done'

const URGENCY_RANK: Record<Urgency, number> = { overdue: 0, dueSoon: 1, open: 2, done: 3 }

export function getNextOpenAction(
  deviceId: string,
  actions: MaintenanceAction[],
): MaintenanceAction | undefined {
  return actions
    .filter((action) => action.deviceId === deviceId && action.status === 'open')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))[0]
}

export function getUrgency(action: MaintenanceAction | undefined): Urgency | undefined {
  if (!action) return undefined
  if (action.status === 'uitgevoerd') return 'done'
  if (isOverdue(action.deadline)) return 'overdue'
  if (isWithin24h(action.deadline)) return 'dueSoon'
  return 'open'
}


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

    const rankA = actionA ? URGENCY_RANK[getUrgency(actionA)!] : 3
    const rankB = actionB ? URGENCY_RANK[getUrgency(actionB)!] : 3
    if (rankA !== rankB) return rankA - rankB
    if (actionA && actionB) return actionA.deadline.localeCompare(actionB.deadline)
    return 0
  })
}
