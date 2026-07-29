import api from '@/lib/axios'

export type UserProductStatus = 'in-stock' | 'low-stock' | 'sold-out'

export type UserProduct = {
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
  status: UserProductStatus
}

export type UserProductCategory = { id: number, name: string }

export async function getUserProducts() {
  const response = await api.get<{ data: UserProduct[] }>('/user/products')
  return response.data.data
}

export async function getUserProductCategories() {
  const response = await api.get<{ data: UserProductCategory[] }>('/user/product-categories')
  return response.data.data
}
