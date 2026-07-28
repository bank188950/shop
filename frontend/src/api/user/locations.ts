import api from '@/lib/axios'

export type CustomerLocation = { id: number, name: string }

export async function getCustomerLocations() {
  const response = await api.get<{ data: CustomerLocation[] }>('/user/locations')
  return response.data.data
}
