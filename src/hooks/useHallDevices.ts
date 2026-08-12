import { useDevices } from './useDevices'

export function useHallDevices(hallId: string | undefined) {
  const query = useDevices()
  const devices = query.data?.filter((device) => device.hallId === hallId) ?? []
  return { ...query, data: devices }
}
