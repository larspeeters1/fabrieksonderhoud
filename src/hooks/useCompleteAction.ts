import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeAction } from '../services/actionService'

export function useCompleteAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => completeAction(id, note),
    onSuccess: () => {
      // The PATCH updates the action directly in json-server, but every
      // screen that reads actions (this page's next/other/executed lists,
      // useDeviceActions, and the hall floor plan/list views via useActions)
      // renders from the shared ['actions'] query cache. React Query has no
      // way to know the server-side status changed just because a mutation
      // ran, so without this explicit invalidation those views would keep
      // showing the now-stale "open" action until something unrelated
      // happened to trigger a refetch.
      queryClient.invalidateQueries({ queryKey: ['actions'] })
    },
  })
}
