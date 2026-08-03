import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createDevice } from '../services/deviceService'
import type { Device } from '../model/types'

export function useCreateDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (device: Omit<Device, 'id'>) => createDevice(device),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })
}
