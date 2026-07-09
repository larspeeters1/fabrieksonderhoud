import { useQuery } from '@tanstack/react-query'
import { getHalls } from '../services/hallService'

export function useHalls() {
  return useQuery({
    queryKey: ['halls'],
    queryFn: getHalls,
  })
}
