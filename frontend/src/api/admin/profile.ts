import api from '@/lib/axios'

export type AdminProfile = { username: string, name: string, avatarUrl: string | null }
export type AdminProfileSaveInput = { name: string, avatar: File | null }

function profileFormData(input: AdminProfileSaveInput) {
  const formData = new FormData()
  formData.append('name', input.name.trim())
  if (input.avatar) formData.append('avatar', input.avatar)
  return formData
}

export async function getAdminProfile() {
  const response = await api.get<{ data: AdminProfile }>('/admin/profile')
  return response.data.data
}

export async function updateAdminProfile(input: AdminProfileSaveInput) {
  const response = await api.post<{ data: AdminProfile }>('/admin/profile', profileFormData(input))
  return response.data.data
}
