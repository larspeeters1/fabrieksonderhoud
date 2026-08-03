import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAction } from '../services/actionService'
import type { MaintenanceAction } from '../model/types'

export function useCreateAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (action: Omit<MaintenanceAction, 'id'>) => createAction(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] })
    },
  })
}
