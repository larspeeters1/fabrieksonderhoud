import { useQuery } from '@tanstack/react-query'
import { getDevices } from '../services/deviceService'

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
  })
}
