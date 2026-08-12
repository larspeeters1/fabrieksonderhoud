import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeAction } from '../services/actionService'

export function useCompleteAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => completeAction(id, note),
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['actions'] })
    },
  })
}
