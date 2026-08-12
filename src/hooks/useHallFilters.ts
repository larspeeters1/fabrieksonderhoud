import { useCallback, useMemo, useState } from 'react'
import { DEFAULT_FILTERS, type HallFilters } from '../model/filters'
export function useHallFilters(initialFilters: HallFilters = DEFAULT_FILTERS, defaultFilters: HallFilters = initialFilters) {

  const [filters, setFilters] = useState<HallFilters>(() => initialFilters)

  const setFilter = useCallback(<K extends keyof HallFilters>(key: K, value: HallFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => setFilters(defaultFilters), [defaultFilters])

  const isDefault = useMemo(
    () =>
      filters.category === defaultFilters.category &&
      filters.actionType === defaultFilters.actionType &&
      filters.status === defaultFilters.status &&
      filters.timeWindow === defaultFilters.timeWindow &&
      filters.highUrgencyOnly === defaultFilters.highUrgencyOnly &&
      filters.search === defaultFilters.search,
    [filters, defaultFilters],
  )

  return { filters, setFilter, resetFilters, isDefault }
}
