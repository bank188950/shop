import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserProfile } from '@/api/user/profile'
import type { UserProfileInput } from '@/api/user/profile'
import { userAuthKey } from '@/features/user/auth/hooks/useUserAuth'

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserProfileInput) => updateUserProfile(input),
    onSuccess: (user) => queryClient.setQueryData(userAuthKey, user),
  })
}
