import api from '@/lib/axios'

export type Announcements = {
  orders: string[]
  advertisements: string[]
  /** popup แจ้งเตือนจากทางร้าน แสดงตาม `isEnabled` แม้ `message` จะยังว่าง */
  notice: { isEnabled: boolean, message: string }
}

export async function getAnnouncements() {
  const response = await api.get<{ data: Announcements }>('/user/announcements')
  return response.data.data
}
