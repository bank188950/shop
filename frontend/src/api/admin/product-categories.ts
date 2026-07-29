import api from '@/lib/axios'

export type AdminProductCategory = {
  id: number
  name: string
  tracksQuantity: boolean
  isActive: boolean
}

function categoryBody(input: Omit<AdminProductCategory, 'id'>) {
  return new URLSearchParams({
    name: input.name.trim(),
    tracks_piece_quantity: input.tracksQuantity ? '1' : '0',
    is_active: input.isActive ? '1' : '0',
  })
}

export async function getAdminProductCategories() {
  const response = await api.get<{ data: AdminProductCategory[] }>('/admin/product-categories')
  return response.data.data
}

export async function getAdminProductCategory(categoryId: number) {
  const response = await api.get<{ data: AdminProductCategory }>(`/admin/product-categories/${categoryId}`)
  return response.data.data
}

export async function createAdminProductCategory(input: Omit<AdminProductCategory, 'id'>) {
  const response = await api.post<{ data: AdminProductCategory }>('/admin/product-categories', categoryBody(input))
  return response.data.data
}

export async function updateAdminProductCategory(categoryId: number, input: Omit<AdminProductCategory, 'id'>) {
  const response = await api.post<{ data: AdminProductCategory }>(`/admin/product-categories/${categoryId}`, categoryBody(input))
  return response.data.data
}

export async function deleteAdminProductCategory(categoryId: number) {
  await api.delete(`/admin/product-categories/${categoryId}`)
}

export async function moveAdminProductCategory(categoryId: number, direction: 'up' | 'down') {
  const body = new URLSearchParams({ direction })
  const response = await api.post<{ data: AdminProductCategory[] }>(`/admin/product-categories/${categoryId}/move`, body)
  return response.data.data
}
