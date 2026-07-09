import type { Device, Hall, MaintenanceAction } from '../model/types'
import { isOverdue, isWithin24h } from './dateUtils'

export interface HallStats {
  deviceCount: number
  openCount: number
  dueSoonCount: number
  overdueCount: number
}

export function calculateHallStats(
  hall: Hall,
  devices: Device[],
  actions: MaintenanceAction[],
): HallStats {
  const hallDevices = devices.filter((device) => device.hallId === hall.id)
  const hallDeviceIds = new Set(hallDevices.map((device) => device.id))
  const openActions = actions.filter(
    (action) => hallDeviceIds.has(action.deviceId) && action.status === 'open',
  )

  return {
    deviceCount: hallDevices.length,
    openCount: openActions.length,
    dueSoonCount: openActions.filter((action) => isWithin24h(action.deadline)).length,
    overdueCount: openActions.filter((action) => isOverdue(action.deadline)).length,
  }
}
