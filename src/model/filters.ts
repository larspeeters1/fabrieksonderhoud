import type { ActionStatus, ActionType, DeviceCategory } from './types'

export type TimeWindow = 0 | 3 | 7 | 30

export interface HallFilters {
  category?: DeviceCategory
  actionType?: ActionType
  status?: ActionStatus
  timeWindow: TimeWindow
  highUrgencyOnly: boolean
  search: string
}

export const DEFAULT_FILTERS: HallFilters = {
  category: undefined,
  actionType: undefined,
  status: undefined,
  timeWindow: 7,
  highUrgencyOnly: false,
  search: '',
}

const CATEGORIES: DeviceCategory[] = ['machine', 'band', 'lamp']
const ACTION_TYPES: ActionType[] = ['controle', 'vervanging', 'herstelling']
const STATUSES: ActionStatus[] = ['open', 'uitgevoerd']
const TIME_WINDOWS: TimeWindow[] = [0, 3, 7, 30]

export function filtersToSearchParams(filters: HallFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.actionType) params.set('actionType', filters.actionType)
  if (filters.status) params.set('status', filters.status)
  if (filters.timeWindow !== DEFAULT_FILTERS.timeWindow) params.set('timeWindow', String(filters.timeWindow))
  if (filters.highUrgencyOnly) params.set('highUrgencyOnly', '1')
  if (filters.search.trim()) params.set('search', filters.search)
  return params
}

export function searchParamsToFilters(params: URLSearchParams): HallFilters {
  const category = params.get('category')
  const actionType = params.get('actionType')
  const status = params.get('status')
  const timeWindow = Number(params.get('timeWindow'))

  return {
    category: CATEGORIES.includes(category as DeviceCategory) ? (category as DeviceCategory) : undefined,
    actionType: ACTION_TYPES.includes(actionType as ActionType) ? (actionType as ActionType) : undefined,
    status: STATUSES.includes(status as ActionStatus) ? (status as ActionStatus) : undefined,
    timeWindow: TIME_WINDOWS.includes(timeWindow as TimeWindow) ? (timeWindow as TimeWindow) : DEFAULT_FILTERS.timeWindow,
    highUrgencyOnly: params.get('highUrgencyOnly') === '1',
    search: params.get('search') ?? '',
  }
}
