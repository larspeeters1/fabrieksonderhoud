import type { TimeWindow } from './filters'

export type ThemeMode = 'light' | 'dark' | 'system'
export type HallView = 'plattegrond' | 'lijst'

export interface Settings {
  themeMode: ThemeMode
  defaultTimeWindow: TimeWindow
  showUrgencyIndicators: boolean
  defaultHallView: HallView
}

export const DEFAULT_SETTINGS: Settings = {
  themeMode: 'system',
  defaultTimeWindow: 7,
  showUrgencyIndicators: true,
  defaultHallView: 'plattegrond',
}
