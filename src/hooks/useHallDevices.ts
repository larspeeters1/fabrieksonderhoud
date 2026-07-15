import { useDevices } from './useDevices'

// Same reasoning as useHall: the full device collection is already cached
// under the ['devices'] query key, so filtering by hallId in memory avoids
// a separate `GET /devices?hallId=...` round trip to json-server. That
// query-param approach only pays off once the device list is too large to
// load in one go.
export function useHallDevices(hallId: string | undefined) {
  const query = useDevices()
  const devices = query.data?.filter((device) => device.hallId === hallId) ?? []
  return { ...query, data: devices }
}
