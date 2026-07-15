import { useActions } from './useActions'

// Same reasoning as useHallDevices: the full action collection is already
// cached under the ['actions'] query key, so filtering by deviceId in memory
// avoids a separate `GET /actions?deviceId=...` round trip to json-server.
export function useDeviceActions(deviceId: string | undefined) {
  const query = useActions()
  const actions = query.data?.filter((action) => action.deviceId === deviceId) ?? []
  return { ...query, data: actions }
}
