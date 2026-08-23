import type { Device, Hall, MaintenanceAction } from '../model/types'
import { getNextOpenAction, getUrgency, type Urgency } from './actionUtils'
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


export type DeviceMarkerUrgency = Urgency

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

        const nextOpen = getNextOpenAction(device.id, actions)
        const lastExecuted = actions
            .filter((action) => action.deviceId === device.id && action.status === 'uitgevoerd')
            .sort((a, b) => (b.executedAt ?? b.deadline).localeCompare(a.executedAt ?? a.deadline))[0]

        const urgency: DeviceMarkerUrgency = getUrgency(nextOpen) ?? getUrgency(lastExecuted) ?? 'open'

        return {
          id: device.id,
          relX: clamp01((device.x - hall.x) / hall.width),
          relY: clamp01((device.y - hall.y) / hall.height),
          urgency,
        }
      })
}