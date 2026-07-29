import api from '@/lib/axios'

export type Announcements = {
  orders: string[]
  advertisements: string[]
}

export async function getAnnouncements() {
  const response = await api.get<{ data: Announcements }>('/user/announcements')
  return response.data.data
}
