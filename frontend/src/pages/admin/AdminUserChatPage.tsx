import { ArrowLeft, ImagePlus, Pencil, Send, SquarePen, Trash2, UserRound, X } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea'
import { deleteAdminUserMessage, getAdminUserMessages, saveAdminUserMessage, updateAdminUserMessage, type AdminUserMessage } from '@/data/admin/user-messages'
import { useUser } from '@/features/admin/user/hooks/useUsers'
import { confirmDelete } from '@/components/sweetalert2/confirm-delete'

const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

function formatMessageDate(value: string) {
  const date = new Date(value)
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function getMessageMinute(value: string) {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`
}

export function AdminUserChatPage() {
  const { userId } = useParams()
  const numericUserId = Number(userId)
  const userQuery = useUser(numericUserId)
  const user = userQuery.data
  const [messages, setMessages] = useState<AdminUserMessage[]>(() => getAdminUserMessages(numericUserId))
  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState<{ name: string; url: string } | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingMessage, setEditingMessage] = useState<AdminUserMessage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)
  const messageGroups = useMemo(() => messages.reduce<{ sentAt: string; messages: AdminUserMessage[] }[]>((groups, message) => {
    const currentGroup = groups.at(-1)
    if (currentGroup && getMessageMinute(currentGroup.sentAt) === getMessageMinute(message.sentAt)) {
      currentGroup.messages.push(message)
    } else {
      groups.push({ sentAt: message.sentAt, messages: [message] })
    }
    return groups
  }, []), [messages])

  useEffect(() => {
    const messageList = messageListRef.current
    if (!messageList) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [messages])

  if (userQuery.isLoading) return <section className="admin-page"><Link className="admin-back-link" to="/admin/users"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าผู้ใช้งาน</Link><p className="page-message">กำลังโหลดผู้ใช้งาน...</p></section>
  if (!user) return <section className="admin-page"><Link className="admin-back-link" to="/admin/users"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าผู้ใช้งาน</Link><p className="page-message">ไม่พบผู้ใช้งาน</p></section>
  const selectedUser = user

  function selectAttachment(file: File | undefined) {
    if (!file) return
    setAttachment({ name: file.name, url: URL.createObjectURL(file) })
  }

  function resetEditing() {
    setEditingMessage(null)
    setText('')
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function toggleEditMode() {
    if (isEditMode) resetEditing()
    setIsEditMode((current) => !current)
  }

  function startEditing(message: AdminUserMessage) {
    setEditingMessage(message)
    setText(message.text)
    setAttachment(message.imageUrl ? { name: 'รูปภาพที่แนบ', url: message.imageUrl } : null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function removeMessage(message: AdminUserMessage) {
    if (!await confirmDelete('ข้อความนี้')) return
    setMessages((current) => current.filter((item) => item.id !== message.id))
    deleteAdminUserMessage(message.id)
    if (editingMessage?.id === message.id) resetEditing()
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const messageText = text.trim()
    if (!messageText && !attachment) return

    if (editingMessage) {
      const updatedMessage = { ...editingMessage, text: messageText, imageUrl: attachment?.url }
      setMessages((current) => current.map((message) => message.id === updatedMessage.id ? updatedMessage : message))
      updateAdminUserMessage(updatedMessage)
      resetEditing()
      return
    }

    const message: AdminUserMessage = { id: String(Date.now()), userId: selectedUser.id, text: messageText, imageUrl: attachment?.url, sentAt: new Date().toISOString() }
    setMessages((current) => [...current, message])
    saveAdminUserMessage(message)
    resetEditing()
  }

  return <section className="admin-page admin-user-chat-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/users"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าผู้ใช้งาน</Link><h1 className="admin-title">ส่งข้อความถึง {selectedUser.name}</h1></div></div>
    <section className="admin-user-chat-card" aria-label={`แชทกับ ${selectedUser.name}`}>
      <header className="admin-user-chat-header"><div className="admin-user-chat-user"><span className="admin-user-chat-avatar"><UserRound size={23} aria-hidden="true" /></span><div><h2>{selectedUser.name}</h2><p>ช่องทางที่แอดมินส่งข้อความถึงผู้ใช้</p></div></div><button type="button" className={`admin-user-chat-edit-mode${isEditMode ? ' is-active' : ''}`} onClick={toggleEditMode} aria-label={isEditMode ? 'ปิดโหมดแก้ไขข้อความ' : 'เปิดโหมดแก้ไขข้อความ'} aria-pressed={isEditMode} title={isEditMode ? 'ปิดโหมดแก้ไข' : 'แก้ไขข้อความ'}><SquarePen size={19} aria-hidden="true" /></button></header>
      <div ref={messageListRef} className="admin-user-message-list" aria-live="polite">{messageGroups.map((group) => <article key={`${group.sentAt}-${group.messages[0].id}`} className="admin-user-message">{group.messages.map((message) => <div key={message.id} className="admin-user-message-entry">{isEditMode && <div className="admin-user-message-item-actions"><button type="button" onClick={() => startEditing(message)} aria-label="แก้ไขข้อความ" title="แก้ไขข้อความ"><Pencil size={14} aria-hidden="true" /></button><button type="button" onClick={() => removeMessage(message)} aria-label="ลบข้อความ" title="ลบข้อความ"><Trash2 size={14} aria-hidden="true" /></button></div>}<div className="admin-user-message-bubble">{message.imageUrl && <img src={message.imageUrl} alt="รูปภาพที่แอดมินแนบ" />}{message.text && <p>{message.text}</p>}</div></div>)}<time dateTime={group.sentAt}>{formatMessageDate(group.sentAt)}</time></article>)}</div>
      <form className="admin-user-message-form" onSubmit={submitMessage}>
        {attachment && <div className="admin-user-attachment"><img src={attachment.url} alt="ตัวอย่างรูปภาพที่จะแนบ" /><span>{attachment.name}</span><button type="button" aria-label="ลบรูปภาพที่แนบ" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = '' }}><X size={16} aria-hidden="true" /></button></div>}
        <Textarea value={text} onChange={(event) => setText(event.target.value)} placeholder={editingMessage ? 'แก้ไขข้อความ' : `พิมพ์ข้อความถึง ${selectedUser.name}`} aria-label={editingMessage ? 'แก้ไขข้อความ' : `ข้อความถึง ${selectedUser.name}`} rows={3} />
        <div className="admin-user-message-actions"><input ref={fileInputRef} id="admin-message-image" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectAttachment(event.target.files?.[0])} /><label htmlFor="admin-message-image" className="admin-user-attach-button"><ImagePlus size={19} aria-hidden="true" />แนบรูป</label>{editingMessage && <button type="button" className="admin-user-cancel-edit-button" onClick={resetEditing}>ยกเลิก</button>}<button type="submit" className="admin-user-send-button" disabled={!text.trim() && !attachment}>{editingMessage ? <Pencil size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}{editingMessage ? 'แก้ไข' : 'ส่งข้อความ'}</button></div>
      </form>
    </section>
  </section>
}
