import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminLocation, deleteAdminLocation, getAdminLocation, getAdminLocations, updateAdminLocation } from '@/api/admin/locations'
import type { AdminLocation } from '@/api/admin/locations'

const locationKeys = {
  all: ['admin', 'locations'] as const,
  list: ['admin', 'locations', 'list'] as const,
  detail: (locationId: number) => ['admin', 'locations', 'detail', locationId] as const,
}

export function useLocations() {
  return useQuery({ queryKey: locationKeys.list, queryFn: getAdminLocations })
}

export function useLocation(locationId?: number) {
  return useQuery({ queryKey: locationKeys.detail(locationId ?? 0), queryFn: () => getAdminLocation(locationId!), enabled: Boolean(locationId) })
}

export function useSaveLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ locationId, input }: { locationId?: number, input: Omit<AdminLocation, 'id'> }) => locationId ? updateAdminLocation(locationId, input) : createAdminLocation(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminLocation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  })
}
