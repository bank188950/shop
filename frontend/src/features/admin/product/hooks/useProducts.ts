import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, deleteProduct, getProduct, getProductCategories, getProducts, getProductUnits, updateProduct } from '@/api/admin/products'
import type { ProductSaveInput } from '../types'

const productKeys = {
  all: ['admin', 'products'] as const,
  list: (page: number, perPage: number) => [...productKeys.all, 'list', page, perPage] as const,
  detail: (productId: number) => [...productKeys.all, 'detail', productId] as const,
  categories: ['admin', 'product-categories', 'options'] as const,
  units: ['admin', 'product-units', 'options'] as const,
}

export function useProducts(page: number, perPage: number) {
  return useQuery({ queryKey: productKeys.list(page, perPage), queryFn: () => getProducts(page, perPage) })
}

export function useProduct(productId?: number) {
  return useQuery({ queryKey: productKeys.detail(productId ?? 0), queryFn: () => getProduct(productId!), enabled: Boolean(productId) })
}

export function useProductCategories() {
  return useQuery({ queryKey: productKeys.categories, queryFn: getProductCategories })
}

export function useProductUnits() {
  return useQuery({ queryKey: productKeys.units, queryFn: getProductUnits })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, input }: { productId: number, input: ProductSaveInput }) => updateProduct(productId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}
