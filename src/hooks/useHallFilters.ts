import { useCallback, useMemo, useState } from 'react'
import { DEFAULT_FILTERS, type HallFilters } from '../model/filters'

export function useHallFilters(initialFilters: HallFilters = DEFAULT_FILTERS) {
  // Lazy initializer: only read `initialFilters` once, on mount. This lets
  // callers seed state from e.g. the URL (returning from an inspection
  // round) without turning it into a continuous two-way sync.
  const [filters, setFilters] = useState<HallFilters>(() => initialFilters)

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
