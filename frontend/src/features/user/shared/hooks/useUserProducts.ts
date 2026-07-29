import { useQuery } from '@tanstack/react-query'
import { getUserProductCategories, getUserProducts } from '@/api/user/products'

export const userProductKeys = {
  list: ['user', 'products'] as const,
  categories: ['user', 'product-categories'] as const,
}

export function useUserProducts() {
  return useQuery({ queryKey: userProductKeys.list, queryFn: getUserProducts })
}

export function useUserProductCategories() {
  return useQuery({ queryKey: userProductKeys.categories, queryFn: getUserProductCategories })
}
