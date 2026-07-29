import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminProductCategory, deleteAdminProductCategory, getAdminProductCategories, getAdminProductCategory, moveAdminProductCategory, updateAdminProductCategory } from '@/api/admin/product-categories'
import type { AdminProductCategory } from '@/api/admin/product-categories'

const categoryKeys = {
  all: ['admin', 'product-categories'] as const,
  list: ['admin', 'product-categories', 'list'] as const,
  detail: (categoryId: number) => ['admin', 'product-categories', 'detail', categoryId] as const,
}

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.list, queryFn: getAdminProductCategories })
}

export function useCategory(categoryId?: number) {
  return useQuery({ queryKey: categoryKeys.detail(categoryId ?? 0), queryFn: () => getAdminProductCategory(categoryId!), enabled: Boolean(categoryId) })
}

export function useSaveCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, input }: { categoryId?: number, input: Omit<AdminProductCategory, 'id'> }) => categoryId ? updateAdminProductCategory(categoryId, input) : createAdminProductCategory(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminProductCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export function useMoveCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, direction }: { categoryId: number, direction: 'up' | 'down' }) => moveAdminProductCategory(categoryId, direction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}
