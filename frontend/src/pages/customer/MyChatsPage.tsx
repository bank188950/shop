import { ChevronLeft, MessageCircle, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminUserMessages, type AdminUserMessage } from '@/features/admin/user/admin-user-messages'
import { StorefrontFooter } from '@/features/customer/shared/StorefrontFooter'
import { StorefrontHeader } from '@/features/customer/shared/StorefrontHeader'

const currentCustomerUserId = 1
const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

function formatMessageDate(value: string) {
  const date = new Date(value)
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function MyChatsPage() {
  const [messages, setMessages] = useState<AdminUserMessage[]>(() => getAdminUserMessages(currentCustomerUserId))

  useEffect(() => {
    const refreshMessages = () => setMessages(getAdminUserMessages(currentCustomerUserId))
    window.addEventListener('focus', refreshMessages)
    window.addEventListener('storage', refreshMessages)
    return () => {
      window.removeEventListener('focus', refreshMessages)
      window.removeEventListener('storage', refreshMessages)
    }
  }, [])

  return <section className="flex min-h-screen flex-col overflow-hidden"><StorefrontHeader /><main className="mx-auto w-full max-w-[760px] flex-1 px-6 py-8 max-md:px-3.5 max-md:py-5">
    <Link to="/" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#76503a] px-5 text-xl font-extrabold text-white no-underline shadow-md shadow-[#76503a]/20 transition hover:bg-[#5f3d2b]"><ChevronLeft size={22} strokeWidth={2.75} aria-hidden="true" />กลับหน้าหลัก</Link>
    <header className="mt-5"><h1 className="m-0 font-heading text-[clamp(2rem,5vw,3rem)] leading-tight text-ink">ข้อความจากแอดมิน</h1></header>
    <section className="mt-5 grid gap-4" aria-label="ข้อความจากแอดมิน" aria-live="polite">
      {messages.length ? messages.map((message) => <article key={message.id} className="rounded-2xl border border-[#b9cbbf] bg-white p-5 shadow-sm max-md:p-4"><header className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 font-heading text-xl text-ink"><span className="grid size-9 place-items-center rounded-full bg-[#e1f3e5] text-brand"><UserRound size={19} aria-hidden="true" /></span>แอดมิน</span><time className="text-right text-sm font-bold text-[#2f7dcc]" dateTime={message.sentAt}>{formatMessageDate(message.sentAt)}</time></header>{message.imageUrl && <img className="mt-4 max-h-[360px] w-auto max-w-full rounded-xl object-cover" src={message.imageUrl} alt="รูปภาพที่แอดมินแนบ" />}{message.text && <p className="mt-4 mb-0 whitespace-pre-wrap text-lg leading-relaxed text-[#34443a]">{message.text}</p>}</article>) : <div className="rounded-2xl border border-dashed border-[#b9cbbf] bg-white px-5 py-12 text-center"><MessageCircle className="mx-auto text-[#56805c]" size={32} aria-hidden="true" /><h2 className="mt-3 mb-0 font-heading text-2xl text-ink">ยังไม่มีข้อความ</h2><p className="mt-1 mb-0 text-lg font-semibold text-muted">เมื่อแอดมินส่งข้อความถึงคุณ จะแสดงที่หน้านี้</p></div>}
    </section>
  </main><StorefrontFooter /></section>
}
