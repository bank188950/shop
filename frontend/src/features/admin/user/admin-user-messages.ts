export type AdminUserMessage = {
  id: string
  userId: number
  text: string
  imageUrl?: string
  sentAt: string
}

const storageKey = 'lookchin-admin-user-messages-v1'

const defaultMessages: AdminUserMessage[] = [
  { id: 'welcome-1', userId: 1, text: 'สวัสดีค่ะ หากมีข้อมูลเกี่ยวกับคำสั่งซื้อจะแจ้งให้ทราบทางนี้', sentAt: '2026-03-12T12:30:00+07:00' },
]

export function getAdminUserMessages(userId: number) {
  try {
    const saved = window.localStorage.getItem(storageKey)
    const messages = saved ? JSON.parse(saved) as AdminUserMessage[] : defaultMessages
    return messages.filter((message) => message.userId === userId)
  } catch {
    return defaultMessages.filter((message) => message.userId === userId)
  }
}

export function saveAdminUserMessage(message: AdminUserMessage) {
  try {
    const saved = window.localStorage.getItem(storageKey)
    const messages = saved ? JSON.parse(saved) as AdminUserMessage[] : defaultMessages
    window.localStorage.setItem(storageKey, JSON.stringify([...messages, message]))
  } catch {
    // Keep the sent message available in the current screen if browser storage is unavailable.
  }
}
