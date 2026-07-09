export type DeviceCategory = 'machine' | 'band' | 'lamp'

export type ActionType = 'controle' | 'vervanging' | 'herstelling'

export type ActionStatus = 'open' | 'uitgevoerd'

export type Role = 'onderhoudsmedewerker' | 'beheerder'

export interface Hall {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
}

export interface Device {
  id: string
  name: string
  category: DeviceCategory
  hallId: string
  x: number
  y: number
  description?: string
  serialNumber?: string
}

export interface MaintenanceAction {
  id: string
  deviceId: string
  type: ActionType
  deadline: string
  status: ActionStatus
  executedAt?: string
  description: string
  noteAfterExecution?: string
}

export interface User {
  username: string
  role: Role
}
