import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminAuth, loginAdmin, logoutAdmin } from '@/api/admin/auth'
import type { AdminLoginInput } from '@/api/admin/auth'

export const adminAuthKey = ['admin', 'auth'] as const

export function useAdminAuth() {
  return useQuery({ queryKey: adminAuthKey, queryFn: getAdminAuth, retry: false })
}

export function useAdminLogin() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: (input: AdminLoginInput) => loginAdmin(input), onSuccess: (admin) => queryClient.setQueryData(adminAuthKey, admin) })
}

export function useAdminLogout() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: logoutAdmin, onSuccess: () => queryClient.clear() })
}
