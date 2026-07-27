import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminSettings, updateAdminSettings } from '@/api/admin/settings'
import type { AdminSettings } from '@/api/admin/settings'

const settingsKey = ['admin', 'settings'] as const
export function useSettings() { return useQuery({ queryKey: settingsKey, queryFn: getAdminSettings }) }
export function useSaveSettings() { const queryClient = useQueryClient(); return useMutation({ mutationFn: (input: AdminSettings) => updateAdminSettings(input), onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKey }) }) }
