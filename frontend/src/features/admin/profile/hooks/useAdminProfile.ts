import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminProfile, updateAdminProfile } from '@/api/admin/profile'
import type { AdminProfileSaveInput } from '@/api/admin/profile'

export const adminProfileKey = ['admin', 'profile'] as const

export function useAdminProfile() {
  return useQuery({ queryKey: adminProfileKey, queryFn: getAdminProfile })
}

export function useSaveAdminProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AdminProfileSaveInput) => updateAdminProfile(input),
    onSuccess: (profile) => queryClient.setQueryData(adminProfileKey, profile),
  })
}
