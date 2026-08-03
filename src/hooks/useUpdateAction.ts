import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateAction } from '../services/actionService'
import type { MaintenanceAction } from '../model/types'

export function useUpdateAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: Omit<MaintenanceAction, 'id'> }) => updateAction(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] })
    },
  })
}
