import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateDevice } from '../services/deviceService'
import type { Device } from '../model/types'

export function useUpdateDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, device }: { id: string; device: Omit<Device, 'id'> }) => updateDevice(id, device),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })
}
