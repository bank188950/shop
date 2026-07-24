import { ArrowLeft, ImagePlus, MessageCircle, Send, UserRound, X } from 'lucide-react'
import { type FormEvent, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea'
import { getAdminUserMessages, saveAdminUserMessage, type AdminUserMessage } from '@/features/admin/user/admin-user-messages'
import { getAdminUsers } from '@/features/admin/user/admin-users'

const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

function formatMessageDate(value: string) {
  const date = new Date(value)
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function AdminUserChatPage() {
  const { userId } = useParams()
  const user = getAdminUsers().find((item) => item.id === Number(userId))
  const numericUserId = Number(userId)
  const [messages, setMessages] = useState<AdminUserMessage[]>(() => getAdminUserMessages(numericUserId))
  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState<{ name: string; url: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) return <section className="admin-page"><Link className="admin-back-link" to="/admin/users"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าผู้ใช้งาน</Link><p className="page-message">ไม่พบผู้ใช้งาน</p></section>
  const selectedUser = user

  function selectAttachment(file: File | undefined) {
    if (!file) return
    setAttachment({ name: file.name, url: URL.createObjectURL(file) })
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const messageText = text.trim()
    if (!messageText && !attachment) return

    const message: AdminUserMessage = { id: String(Date.now()), userId: selectedUser.id, text: messageText, imageUrl: attachment?.url, sentAt: new Date().toISOString() }
    setMessages((current) => [...current, message])
    saveAdminUserMessage(message)
    setText('')
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return <section className="admin-page admin-user-chat-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/users"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าผู้ใช้งาน</Link><h1 className="admin-title">ส่งข้อความถึง {selectedUser.name}</h1></div></div>
    <section className="admin-user-chat-card" aria-label={`แชทกับ ${selectedUser.name}`}>
      <header className="admin-user-chat-header"><span className="admin-user-chat-avatar"><UserRound size={23} aria-hidden="true" /></span><div><h2>{selectedUser.name}</h2><p><MessageCircle size={16} aria-hidden="true" />แอดมินส่งข้อความถึงผู้ใช้ได้ฝ่ายเดียว</p></div></header>
      <div className="admin-user-message-list" aria-live="polite">{messages.map((message) => <article key={message.id} className="admin-user-message"><div className="admin-user-message-bubble">{message.imageUrl && <img src={message.imageUrl} alt="รูปภาพที่แอดมินแนบ" />}{message.text && <p>{message.text}</p>}</div><time dateTime={message.sentAt}>{formatMessageDate(message.sentAt)}</time></article>)}</div>
      <form className="admin-user-message-form" onSubmit={submitMessage}>
        {attachment && <div className="admin-user-attachment"><img src={attachment.url} alt="ตัวอย่างรูปภาพที่จะแนบ" /><span>{attachment.name}</span><button type="button" aria-label="ลบรูปภาพที่แนบ" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = '' }}><X size={16} aria-hidden="true" /></button></div>}
        <Textarea value={text} onChange={(event) => setText(event.target.value)} placeholder={`พิมพ์ข้อความถึง ${selectedUser.name}`} aria-label={`ข้อความถึง ${selectedUser.name}`} rows={3} />
        <div className="admin-user-message-actions"><input ref={fileInputRef} id="admin-message-image" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectAttachment(event.target.files?.[0])} /><label htmlFor="admin-message-image" className="admin-user-attach-button"><ImagePlus size={19} aria-hidden="true" />แนบรูป</label><button type="submit" className="admin-user-send-button" disabled={!text.trim() && !attachment}><Send size={18} aria-hidden="true" />ส่งข้อความ</button></div>
      </form>
    </section>
  </section>
}
