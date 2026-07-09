import { api } from './api'
import type { Device } from '../model/types'

export async function getDevices(): Promise<Device[]> {
  const response = await api.get<Device[]>('/devices')
  return response.data
}
