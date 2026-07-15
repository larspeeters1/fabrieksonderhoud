import { useCallback, useMemo, useState } from 'react'
import { DEFAULT_FILTERS, type HallFilters } from '../model/filters'

export function useHallFilters() {
  const [filters, setFilters] = useState<HallFilters>(DEFAULT_FILTERS)

  const setFilter = useCallback(<K extends keyof HallFilters>(key: K, value: HallFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const isDefault = useMemo(
    () =>
      filters.category === DEFAULT_FILTERS.category &&
      filters.actionType === DEFAULT_FILTERS.actionType &&
      filters.status === DEFAULT_FILTERS.status &&
      filters.timeWindow === DEFAULT_FILTERS.timeWindow &&
      filters.highUrgencyOnly === DEFAULT_FILTERS.highUrgencyOnly &&
      filters.search === DEFAULT_FILTERS.search,
    [filters],
  )

  return { filters, setFilter, resetFilters, isDefault }
}
