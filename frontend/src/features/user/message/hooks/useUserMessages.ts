import { useQuery } from '@tanstack/react-query'
import { getUserMessages } from '@/api/user/messages'

export const userMessageKeys = { inbox: ['user', 'messages'] as const }

export function useUserMessages(enabled = true) {
  return useQuery({ queryKey: userMessageKeys.inbox, queryFn: getUserMessages, enabled, retry: false })
}
