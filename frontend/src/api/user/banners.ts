import api from '@/lib/axios'

export type UserBanner = {
  id: number
  title: string
  imageUrl: string
}

export async function getBanners() {
  const response = await api.get<{ data: UserBanner[] }>('/user/banners')
  return response.data.data
}
