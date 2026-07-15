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
