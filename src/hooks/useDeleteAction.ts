import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAction } from '../services/actionService'

export function useDeleteAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] })
    },
  })
}
