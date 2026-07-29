import api from '@/lib/axios'
import type { UserAuth } from '@/api/user/auth'

export type UserProfileInput = {
  name: string
  phone: string
  lineId: string
  locationId: string
}

export async function updateUserProfile(input: UserProfileInput) {
  const body = new URLSearchParams({
    name: input.name.trim(),
    phone: input.phone.trim(),
    line_id: input.lineId.trim(),
    location_id: input.locationId,
  })
  const response = await api.post<{ data: UserAuth }>('/user/profile', body)
  return response.data.data
}
