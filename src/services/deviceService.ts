import { api } from './api'
import type { Device } from '../model/types'

export async function getDevices(): Promise<Device[]> {
  const response = await api.get<Device[]>('/devices')
  return response.data
}

export async function createDevice(device: Omit<Device, 'id'>): Promise<Device> {
  const response = await api.post<Device>('/devices', device)
  return response.data
}

export async function updateDevice(id: string, device: Omit<Device, 'id'>): Promise<Device> {
  const response = await api.patch<Device>(`/devices/${id}`, device)
  return response.data
}

export async function deleteDevice(id: string): Promise<void> {
  await api.delete(`/devices/${id}`)
}
