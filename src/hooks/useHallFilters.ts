import { useCallback, useMemo, useState } from 'react'
import { DEFAULT_FILTERS, type HallFilters } from '../model/filters'

// `defaultFilters` is what "Reset filters" restores — normally the user's
// settings-derived default (e.g. their preferred time window), which can
// differ from `initialFilters` (a one-off seed, e.g. from a URL returning
// from an inspection round).
export function useHallFilters(initialFilters: HallFilters = DEFAULT_FILTERS, defaultFilters: HallFilters = initialFilters) {
  // Lazy initializer: only read `initialFilters` once, on mount. This lets
  // callers seed state from e.g. the URL (returning from an inspection
  // round) without turning it into a continuous two-way sync.
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
