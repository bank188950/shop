import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminProductUnit, deleteAdminProductUnit, getAdminProductUnit, getAdminProductUnits, updateAdminProductUnit } from '@/api/admin/product-units'

const unitKeys = {
  all: ['admin', 'product-units'] as const,
  list: ['admin', 'product-units', 'list'] as const,
  detail: (unitId: number) => ['admin', 'product-units', 'detail', unitId] as const,
}

export function useUnits() {
  return useQuery({ queryKey: unitKeys.list, queryFn: getAdminProductUnits })
}

export function useUnit(unitId?: number) {
  return useQuery({ queryKey: unitKeys.detail(unitId ?? 0), queryFn: () => getAdminProductUnit(unitId!), enabled: Boolean(unitId) })
}

export function useSaveUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, name }: { unitId?: number, name: string }) => unitId ? updateAdminProductUnit(unitId, name) : createAdminProductUnit(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: unitKeys.all }),
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminProductUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: unitKeys.all }),
  })
}
