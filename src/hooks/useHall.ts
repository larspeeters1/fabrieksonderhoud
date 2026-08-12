import { useHalls } from './useHalls'

export function useHall(hallId: string | undefined) {
  const query = useHalls()
  const hall = query.data?.find((h) => h.id === hallId)
  return { ...query, data: hall }
}
