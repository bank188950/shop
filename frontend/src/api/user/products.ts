import api from '@/lib/axios'

export type CustomerProductStatus = 'in-stock' | 'low-stock' | 'sold-out'

export type CustomerProduct = {
  id: number
  name: string
  description: string
  imageUrl: string | null
  price: number
  categoryId: number
  categoryName: string
  unitName: string
  stockQuantity: number
  isRecommended: boolean
  status: CustomerProductStatus
}

export type CustomerProductCategory = { id: number, name: string }

export async function getCustomerProducts() {
  const response = await api.get<{ data: CustomerProduct[] }>('/user/products')
  return response.data.data
}

export async function getCustomerProductCategories() {
  const response = await api.get<{ data: CustomerProductCategory[] }>('/user/product-categories')
  return response.data.data
}
