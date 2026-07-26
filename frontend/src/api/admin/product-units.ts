import api from '@/lib/axios'

export type AdminProductUnit = { id: number, name: string }

function unitBody(name: string) {
  return new URLSearchParams({ name: name.trim() })
}

export async function getAdminProductUnits() {
  const response = await api.get<{ data: AdminProductUnit[] }>('/admin/product-units')
  return response.data.data
}

export async function getAdminProductUnit(unitId: number) {
  const response = await api.get<{ data: AdminProductUnit }>(`/admin/product-units/${unitId}`)
  return response.data.data
}

export async function createAdminProductUnit(name: string) {
  const response = await api.post<{ data: AdminProductUnit }>('/admin/product-units', unitBody(name))
  return response.data.data
}

export async function updateAdminProductUnit(unitId: number, name: string) {
  const response = await api.post<{ data: AdminProductUnit }>(`/admin/product-units/${unitId}`, unitBody(name))
  return response.data.data
}

export async function deleteAdminProductUnit(unitId: number) {
  await api.delete(`/admin/product-units/${unitId}`)
}
