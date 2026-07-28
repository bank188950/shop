import { useQuery } from '@tanstack/react-query'
import { getCustomerProductCategories, getCustomerProducts } from '@/api/user/products'

export const customerProductKeys = {
  list: ['user', 'products'] as const,
  categories: ['user', 'product-categories'] as const,
}

export function useCustomerProducts() {
  return useQuery({ queryKey: customerProductKeys.list, queryFn: getCustomerProducts })
}

export function useCustomerProductCategories() {
  return useQuery({ queryKey: customerProductKeys.categories, queryFn: getCustomerProductCategories })
}
