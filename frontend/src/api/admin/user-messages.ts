import api from '@/lib/axios'

export type AdminUserMessage = {
  id: number
  userId: number
  text: string
  imageUrl: string | null
  sentAt: string
}

export type UserMessageSaveInput = {
  text: string
  image: File | null
  removeImage: boolean
}

function userMessageFormData(input: UserMessageSaveInput) {
  const formData = new FormData()
  formData.append('body', input.text.trim())
  formData.append('remove_image', input.removeImage ? '1' : '0')
  if (input.image) formData.append('image', input.image)
  return formData
}

export async function getAdminUserMessages(userId: number) {
  const response = await api.get<{ data: AdminUserMessage[] }>(`/admin/users/${userId}/messages`)
  return response.data.data
}

export async function createAdminUserMessage(userId: number, input: UserMessageSaveInput) {
  const response = await api.post<{ data: AdminUserMessage }>(`/admin/users/${userId}/messages`, userMessageFormData(input))
  return response.data.data
}

export async function updateAdminUserMessage(userId: number, messageId: number, input: UserMessageSaveInput) {
  const response = await api.post<{ data: AdminUserMessage }>(`/admin/users/${userId}/messages/${messageId}`, userMessageFormData(input))
  return response.data.data
}

export async function deleteAdminUserMessage(userId: number, messageId: number) {
  await api.delete(`/admin/users/${userId}/messages/${messageId}`)
}
