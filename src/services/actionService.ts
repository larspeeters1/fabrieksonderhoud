import { api } from './api'
import type { MaintenanceAction } from '../model/types'
import { getTodayISODate } from '../utils/dateUtils'

export async function getActions(): Promise<MaintenanceAction[]> {
  const response = await api.get<MaintenanceAction[]>('/actions')
  return response.data
}

export async function completeAction(id: string, note?: string): Promise<MaintenanceAction> {
  const response = await api.patch<MaintenanceAction>(`/actions/${id}`, {
    status: 'uitgevoerd',
    executedAt: getTodayISODate(),
    noteAfterExecution: note || undefined,
  })
  return response.data
}

export async function createAction(action: Omit<MaintenanceAction, 'id'>): Promise<MaintenanceAction> {
  const response = await api.post<MaintenanceAction>('/actions', action)
  return response.data
}

export async function updateAction(id: string, action: Omit<MaintenanceAction, 'id'>): Promise<MaintenanceAction> {
  const response = await api.patch<MaintenanceAction>(`/actions/${id}`, action)
  return response.data
}

export async function deleteAction(id: string): Promise<void> {
  await api.delete(`/actions/${id}`)
}
