import { useActions } from './useActions'

export function useDeviceActions(deviceId: string | undefined) {
  const query = useActions()
  const actions = query.data?.filter((action) => action.deviceId === deviceId) ?? []
  return { ...query, data: actions }
}
