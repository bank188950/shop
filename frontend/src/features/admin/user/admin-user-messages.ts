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
  { id: 'welcome-2', userId: 1, text: 'หากมีข้อสงสัย สามารถสอบถามแอดมินได้เลยค่ะ', sentAt: '2026-03-12T12:30:30+07:00' },
]

type MessageStorage = {
  messages: AdminUserMessage[]
  removedDefaultMessageIds: string[]
}

function getMessageStorage(): MessageStorage {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return { messages: [], removedDefaultMessageIds: [] }
    const parsed = JSON.parse(saved) as AdminUserMessage[] | Partial<MessageStorage>
    if (Array.isArray(parsed)) return { messages: parsed, removedDefaultMessageIds: [] }
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      removedDefaultMessageIds: Array.isArray(parsed.removedDefaultMessageIds) ? parsed.removedDefaultMessageIds : [],
    }
  } catch {
    return { messages: [], removedDefaultMessageIds: [] }
  }
}

function getAllMessages() {
  const storage = getMessageStorage()
  const savedMessageIds = new Set(storage.messages.map((message) => message.id))
  const removedDefaultMessageIds = new Set(storage.removedDefaultMessageIds)
  const messages = [...defaultMessages.filter((message) => !savedMessageIds.has(message.id) && !removedDefaultMessageIds.has(message.id)), ...storage.messages]
  return { storage, messages }
}

function saveMessageStorage(storage: MessageStorage) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(storage))
  } catch {
    // Keep changes available in the current screen if browser storage is unavailable.
  }
}

export function getAdminUserMessages(userId: number) {
  return getAllMessages().messages.filter((message) => message.userId === userId)
}

export function saveAdminUserMessage(message: AdminUserMessage) {
  const { storage, messages } = getAllMessages()
  saveMessageStorage({ ...storage, messages: [...messages, message] })
}

export function updateAdminUserMessage(message: AdminUserMessage) {
  const { storage, messages } = getAllMessages()
  saveMessageStorage({ ...storage, messages: messages.map((item) => item.id === message.id ? message : item) })
}

export function deleteAdminUserMessage(messageId: string) {
  const { storage, messages } = getAllMessages()
  const isDefaultMessage = defaultMessages.some((message) => message.id === messageId)
  saveMessageStorage({
    messages: messages.filter((message) => message.id !== messageId),
    removedDefaultMessageIds: isDefaultMessage ? [...new Set([...storage.removedDefaultMessageIds, messageId])] : storage.removedDefaultMessageIds,
  })
}
