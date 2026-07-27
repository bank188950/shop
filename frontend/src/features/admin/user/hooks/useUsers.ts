import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminUser, deleteAdminUser, getAdminUser, getAdminUsers, updateAdminUser } from '@/api/admin/users'
import type { UserSaveInput } from '@/api/admin/users'

const userKeys = { all: ['admin', 'users'] as const, list: ['admin', 'users', 'list'] as const, detail: (id: number) => ['admin', 'users', 'detail', id] as const }
export function useUsers() { return useQuery({ queryKey: userKeys.list, queryFn: getAdminUsers }) }
export function useUser(userId?: number) { return useQuery({ queryKey: userKeys.detail(userId ?? 0), queryFn: () => getAdminUser(userId!), enabled: Boolean(userId) }) }
export function useSaveUser() { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ userId, input }: { userId?: number, input: UserSaveInput }) => userId ? updateAdminUser(userId, input) : createAdminUser(input), onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }) }) }
export function useDeleteUser() { const queryClient = useQueryClient(); return useMutation({ mutationFn: deleteAdminUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }) }) }
