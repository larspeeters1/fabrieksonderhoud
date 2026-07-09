import { api } from './api'
import type { Hall } from '../model/types'

export async function getHalls(): Promise<Hall[]> {
  const response = await api.get<Hall[]>('/halls')
  return response.data
}
