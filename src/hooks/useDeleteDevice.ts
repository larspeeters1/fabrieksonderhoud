import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAction } from '../services/actionService'
import { deleteDevice } from '../services/deviceService'
import type { MaintenanceAction } from '../model/types'

export function useDeleteDevice() {
  const queryClient = useQueryClient()

  return useMutation({

    mutationFn: async (deviceId: string) => {
      const actions = queryClient.getQueryData<MaintenanceAction[]>(['actions']) ?? []
      const relatedActionIds = actions.filter((action) => action.deviceId === deviceId).map((action) => action.id)
      await Promise.all(relatedActionIds.map((id) => deleteAction(id)))
      await deleteDevice(deviceId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['actions'] })
    },
  })
}
