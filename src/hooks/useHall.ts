import { useHalls } from './useHalls'

// The hall list is small and already fetched in full under the ['halls']
// query key (see useHalls), so react-query keeps it cached. Filtering here
// in memory reuses that cache instead of firing a second json-server
// request (e.g. GET /halls?id=...) for data we already have client-side.
export function useHall(hallId: string | undefined) {
  const query = useHalls()
  const hall = query.data?.find((h) => h.id === hallId)
  return { ...query, data: hall }
}
