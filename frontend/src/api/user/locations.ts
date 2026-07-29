import api from '@/lib/axios'

export type UserLocation = { id: number, name: string }

export async function getUserLocations() {
  const response = await api.get<{ data: UserLocation[] }>('/user/locations')
  return response.data.data
}
