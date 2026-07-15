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

export type DeviceMarkerUrgency = 'overdue' | 'dueSoon' | 'normal'

export interface HallDeviceMarker {
  id: string
  relX: number
  relY: number
  urgency: DeviceMarkerUrgency
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function getHallDeviceMarkers(
  hall: Hall,
  devices: Device[],
  actions: MaintenanceAction[],
): HallDeviceMarker[] {
  return devices
    .filter((device) => device.hallId === hall.id)
    .map((device) => {
      const deviceActions = actions.filter(
        (action) => action.deviceId === device.id && action.status === 'open',
      )
      const urgency: DeviceMarkerUrgency = deviceActions.some((action) => isOverdue(action.deadline))
        ? 'overdue'
        : deviceActions.some((action) => isWithin24h(action.deadline))
          ? 'dueSoon'
          : 'normal'

      return {
        id: device.id,
        relX: clamp01((device.x - hall.x) / hall.width),
        relY: clamp01((device.y - hall.y) / hall.height),
        urgency,
      }
    })
}
