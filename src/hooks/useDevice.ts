import { useDevices } from './useDevices'

export function useDevice(deviceId: string | undefined) {
  const query = useDevices()
  const device = query.data?.find((device) => device.id === deviceId)
  return { ...query, data: device }
}
