import { ArrowLeft, ImagePlus, Pencil, Send, SquarePen, Trash2, UserRound, X } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea'
import type { AdminUserMessage } from '@/api/admin/user-messages'
import { useDeleteUserMessage, useSaveUserMessage, useUserMessages } from '@/features/admin/user/hooks/useUserMessages'
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

type Attachment = { name: string, url: string, file: File | null }

export function AdminUserChatPage() {
  const { userId } = useParams()
  const numericUserId = Number(userId)
  const userQuery = useUser(numericUserId)
  const messagesQuery = useUserMessages(numericUserId)
  const saveMessageMutation = useSaveUserMessage()
  const deleteMessageMutation = useDeleteUserMessage()
  const user = userQuery.data
  const messages = messagesQuery.data ?? []
  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingMessage, setEditingMessage] = useState<AdminUserMessage | null>(null)
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)
  const messageGroups = useMemo(() => messages.reduce<{ sentAt: string; messages: AdminUserMessage[] }[]>((groups, message) => {
    const currentGroup = groups.at(-1)
    if (currentGroup && getMessageMinute(currentGroup.sentAt) === getMessageMinute(message.sentAt)) currentGroup.messages.push(message)
    else groups.push({ sentAt: message.sentAt, messages: [message] })
    return groups
  }, []), [messages])

  useEffect(() => {
    const messageList = messageListRef.current
    if (!messageList) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [messages])

  useEffect(() => () => {
    if (attachment?.file) URL.revokeObjectURL(attachment.url)
  }, [attachment])

  if (userQuery.isLoading) return <section className="admin-page"><Link className="admin-back-link" to="/admin/users"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าผู้ใช้งาน</Link><p className="page-message">กำลังโหลดผู้ใช้งาน...</p></section>
  if (!user) return <section className="admin-page"><Link className="admin-back-link" to="/admin/users"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าผู้ใช้งาน</Link><p className="page-message">ไม่พบผู้ใช้งาน</p></section>

  function clearAttachment() {
    if (attachment?.file) URL.revokeObjectURL(attachment.url)
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function selectAttachment(file: File | undefined) {
    if (!file) return
    if (attachment?.file) URL.revokeObjectURL(attachment.url)
    setAttachment({ name: file.name, url: URL.createObjectURL(file), file })
  }

  function resetEditing() {
    setEditingMessage(null)
    setText('')
    clearAttachment()
    setSubmitError('')
  }

  function toggleEditMode() {
    if (isEditMode) resetEditing()
    setIsEditMode((current) => !current)
  }

  function startEditing(message: AdminUserMessage) {
    resetEditing()
    setEditingMessage(message)
    setText(message.text)
    if (message.imageUrl) setAttachment({ name: 'รูปภาพที่แนบ', url: message.imageUrl, file: null })
  }

  async function removeMessage(message: AdminUserMessage) {
    if (!await confirmDelete('ข้อความนี้')) return
    try {
      await deleteMessageMutation.mutateAsync({ userId: numericUserId, messageId: message.id })
      if (editingMessage?.id === message.id) resetEditing()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'ไม่สามารถลบข้อความได้')
    }
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const messageText = text.trim()
    if (!messageText && !attachment) return
    setSubmitError('')
    try {
      await saveMessageMutation.mutateAsync({
        userId: numericUserId,
        messageId: editingMessage?.id,
        input: { text: messageText, image: attachment?.file ?? null, removeImage: Boolean(editingMessage?.imageUrl && !attachment) },
      })
      resetEditing()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อความได้')
    }
  }

  const isSaving = saveMessageMutation.isPending || deleteMessageMutation.isPending
  return <section className="admin-page admin-user-chat-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/users"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าผู้ใช้งาน</Link><h1 className="admin-title">ส่งข้อความถึง {user.name}</h1></div></div>
    <section className="admin-user-chat-card" aria-label={`แชทกับ ${user.name}`}>
      <header className="admin-user-chat-header"><div className="admin-user-chat-user"><span className="admin-user-chat-avatar"><UserRound size={23} aria-hidden="true" /></span><div><h2>{user.name}</h2><p>ช่องทางที่แอดมินส่งข้อความถึงผู้ใช้</p></div></div><button type="button" className={`admin-user-chat-edit-mode${isEditMode ? ' is-active' : ''}`} onClick={toggleEditMode} aria-label={isEditMode ? 'ปิดโหมดแก้ไขข้อความ' : 'เปิดโหมดแก้ไขข้อความ'} aria-pressed={isEditMode} title={isEditMode ? 'ปิดโหมดแก้ไข' : 'แก้ไขข้อความ'}><SquarePen size={19} aria-hidden="true" /></button></header>
      <div ref={messageListRef} className="admin-user-message-list" aria-live="polite">
        {messagesQuery.isLoading && <p className="page-message">กำลังโหลดข้อความ...</p>}
        {messagesQuery.isError && <p className="page-message">ไม่สามารถโหลดข้อความได้: {messagesQuery.error.message}</p>}
        {messageGroups.map((group) => <article key={`${group.sentAt}-${group.messages[0].id}`} className="admin-user-message">{group.messages.map((message) => <div key={message.id} className="admin-user-message-entry">{isEditMode && <div className="admin-user-message-item-actions"><button type="button" onClick={() => startEditing(message)} aria-label="แก้ไขข้อความ" title="แก้ไขข้อความ"><Pencil size={14} aria-hidden="true" /></button><button type="button" disabled={isSaving} onClick={() => removeMessage(message)} aria-label="ลบข้อความ" title="ลบข้อความ"><Trash2 size={14} aria-hidden="true" /></button></div>}<div className="admin-user-message-bubble">{message.imageUrl && <img src={message.imageUrl} alt="รูปภาพที่แอดมินแนบ" />}{message.text && <p>{message.text}</p>}</div></div>)}<time dateTime={group.sentAt}>{formatMessageDate(group.sentAt)}</time></article>)}
      </div>
      <form className="admin-user-message-form" onSubmit={submitMessage}>
        {attachment && <div className="admin-user-attachment"><img src={attachment.url} alt="ตัวอย่างรูปภาพที่จะแนบ" /><span>{attachment.name}</span><button type="button" aria-label="ลบรูปภาพที่แนบ" onClick={clearAttachment}><X size={16} aria-hidden="true" /></button></div>}
        {submitError && <p className="admin-user-message-error" role="alert">{submitError}</p>}
        <Textarea value={text} onChange={(event) => setText(event.target.value)} placeholder={editingMessage ? 'แก้ไขข้อความ' : `พิมพ์ข้อความถึง ${user.name}`} aria-label={editingMessage ? 'แก้ไขข้อความ' : `ข้อความถึง ${user.name}`} rows={3} />
        <div className="admin-user-message-actions"><input ref={fileInputRef} id="admin-message-image" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectAttachment(event.target.files?.[0])} /><label htmlFor="admin-message-image" className="admin-user-attach-button"><ImagePlus size={19} aria-hidden="true" />แนบรูป</label>{editingMessage && <button type="button" className="admin-user-cancel-edit-button" onClick={resetEditing}>ยกเลิก</button>}<button type="submit" className="admin-user-send-button" disabled={isSaving || (!text.trim() && !attachment)}>{editingMessage ? <Pencil size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}{editingMessage ? 'แก้ไข' : 'ส่งข้อความ'}</button></div>
      </form>
    </section>
  </section>
}
