import { api } from './api'
import type { MaintenanceAction } from '../model/types'

export async function getActions(): Promise<MaintenanceAction[]> {
  const response = await api.get<MaintenanceAction[]>('/actions')
  return response.data
}
