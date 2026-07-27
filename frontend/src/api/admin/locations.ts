import api from '@/lib/axios'

export type AdminLocation = {
  id: number
  name: string
  isActive: boolean
}

function locationBody(input: Omit<AdminLocation, 'id'>) {
  return new URLSearchParams({
    name: input.name.trim(),
    is_active: input.isActive ? '1' : '0',
  })
}

export async function getAdminLocations() {
  const response = await api.get<{ data: AdminLocation[] }>('/admin/locations')
  return response.data.data
}

export async function getAdminLocation(locationId: number) {
  const response = await api.get<{ data: AdminLocation }>(`/admin/locations/${locationId}`)
  return response.data.data
}

export async function createAdminLocation(input: Omit<AdminLocation, 'id'>) {
  const response = await api.post<{ data: AdminLocation }>('/admin/locations', locationBody(input))
  return response.data.data
}

export async function updateAdminLocation(locationId: number, input: Omit<AdminLocation, 'id'>) {
  const response = await api.post<{ data: AdminLocation }>(`/admin/locations/${locationId}`, locationBody(input))
  return response.data.data
}

export async function deleteAdminLocation(locationId: number) {
  await api.delete(`/admin/locations/${locationId}`)
}
