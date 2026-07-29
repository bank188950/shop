import api from '@/lib/axios'

export type AdminBanner = {
  id: number
  title: string
  imageUrl: string
  isActive: boolean
}

export type BannerSaveInput = {
  title: string
  image: File | null
  isActive: boolean
}

function bannerFormData(input: BannerSaveInput) {
  const formData = new FormData()
  formData.append('title', input.title.trim())
  formData.append('is_active', input.isActive ? '1' : '0')
  if (input.image) formData.append('image', input.image)
  return formData
}

export async function getAdminBanners() {
  const response = await api.get<{ data: AdminBanner[] }>('/admin/banners')
  return response.data.data
}

export async function getAdminBanner(bannerId: number) {
  const response = await api.get<{ data: AdminBanner }>(`/admin/banners/${bannerId}`)
  return response.data.data
}

export async function createAdminBanner(input: BannerSaveInput) {
  const response = await api.post<{ data: AdminBanner }>('/admin/banners', bannerFormData(input))
  return response.data.data
}

export async function updateAdminBanner(bannerId: number, input: BannerSaveInput) {
  const response = await api.post<{ data: AdminBanner }>(`/admin/banners/${bannerId}`, bannerFormData(input))
  return response.data.data
}

export async function deleteAdminBanner(bannerId: number) {
  await api.delete(`/admin/banners/${bannerId}`)
}

export async function moveAdminBanner(bannerId: number, direction: 'up' | 'down') {
  const body = new URLSearchParams({ direction })
  const response = await api.post<{ data: AdminBanner[] }>(`/admin/banners/${bannerId}/move`, body)
  return response.data.data
}
