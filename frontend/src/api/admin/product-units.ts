import api from '@/lib/axios'

export type AdminProductUnit = { id: number, name: string, isActive: boolean }

function unitBody(input: Omit<AdminProductUnit, 'id'>) {
  return new URLSearchParams({
    name: input.name.trim(),
    is_active: input.isActive ? '1' : '0',
  })
}

export async function getAdminProductUnits() {
  const response = await api.get<{ data: AdminProductUnit[] }>('/admin/product-units')
  return response.data.data
}

export async function getAdminProductUnit(unitId: number) {
  const response = await api.get<{ data: AdminProductUnit }>(`/admin/product-units/${unitId}`)
  return response.data.data
}

export async function createAdminProductUnit(input: Omit<AdminProductUnit, 'id'>) {
  const response = await api.post<{ data: AdminProductUnit }>('/admin/product-units', unitBody(input))
  return response.data.data
}

export async function updateAdminProductUnit(unitId: number, input: Omit<AdminProductUnit, 'id'>) {
  const response = await api.post<{ data: AdminProductUnit }>(`/admin/product-units/${unitId}`, unitBody(input))
  return response.data.data
}

export async function deleteAdminProductUnit(unitId: number) {
  await api.delete(`/admin/product-units/${unitId}`)
}
