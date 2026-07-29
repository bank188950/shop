import api from '@/lib/axios'

export type UserMessage = {
  id: number
  userId: number
  text: string
  imageUrl: string | null
  sentAt: string
}

export type UserInbox = {
  adminAvatarUrl: string | null
  messages: UserMessage[]
}

export async function getUserMessages() {
  const response = await api.get<{ data: UserInbox }>('/user/messages')
  return response.data.data
}
