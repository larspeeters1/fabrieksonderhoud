import { useDevices } from './useDevices'

// Same reasoning as useHall: the full device collection is already cached
// under the ['devices'] query key, so finding one device by id in memory
// avoids a separate `GET /devices/:id` round trip to json-server.
export function useDevice(deviceId: string | undefined) {
  const query = useDevices()
  const device = query.data?.find((device) => device.id === deviceId)
  return { ...query, data: device }
}
