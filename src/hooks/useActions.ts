import { useQuery } from '@tanstack/react-query'
import { getActions } from '../services/actionService'

export function useActions() {
  return useQuery({
    queryKey: ['actions'],
    queryFn: getActions,
  })
}
