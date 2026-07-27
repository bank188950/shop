import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminUserMessage, deleteAdminUserMessage, getAdminUserMessages, updateAdminUserMessage } from '@/api/admin/user-messages'
import type { UserMessageSaveInput } from '@/api/admin/user-messages'

const userMessageKeys = {
  all: ['admin', 'user-messages'] as const,
  list: (userId: number) => ['admin', 'user-messages', userId] as const,
}

export function useUserMessages(userId?: number) {
  return useQuery({ queryKey: userMessageKeys.list(userId ?? 0), queryFn: () => getAdminUserMessages(userId!), enabled: Boolean(userId) })
}

export function useSaveUserMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, messageId, input }: { userId: number, messageId?: number, input: UserMessageSaveInput }) => messageId ? updateAdminUserMessage(userId, messageId, input) : createAdminUserMessage(userId, input),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userMessageKeys.list(userId) })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useDeleteUserMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, messageId }: { userId: number, messageId: number }) => deleteAdminUserMessage(userId, messageId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userMessageKeys.list(userId) })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}
