import { ChevronLeft, MessageCircle, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StorefrontFooter } from '@/features/user/shared/StorefrontFooter'
import { StorefrontHeader } from '@/features/user/shared/StorefrontHeader'
import { StorefrontPagination } from '@/features/user/shared/StorefrontPagination'
import { useUserAuth } from '@/features/user/auth/hooks/useUserAuth'
import { useUserMessages } from '@/features/user/message/hooks/useUserMessages'
import type { UserMessage } from '@/api/user/messages'

const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

function formatMessageDate(value: string) {
  const date = new Date(value)
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function getMessageMinute(value: string) {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`
}

function AdminAvatar({ avatarUrl }: { avatarUrl: string | null }) {
  if (avatarUrl) return <img className="size-9 rounded-full object-cover" src={avatarUrl} alt="" />
  return <span className="grid size-9 place-items-center rounded-full bg-[#e1f3e5] text-brand"><UserRound size={19} aria-hidden="true" /></span>
}

const pageSize = 10

export function MyChatsPage() {
  const authQuery = useUserAuth()
  const inboxQuery = useUserMessages(Boolean(authQuery.data))
  const [page, setPage] = useState(1)
  const messages = inboxQuery.data?.messages ?? []
  const messageGroups = useMemo(() => messages.reduce<{ sentAt: string; messages: UserMessage[] }[]>((groups, message) => {
    const currentGroup = groups.at(-1)
    if (currentGroup && getMessageMinute(currentGroup.sentAt) === getMessageMinute(message.sentAt)) {
      currentGroup.messages.push(message)
    } else {
      groups.push({ sentAt: message.sentAt, messages: [message] })
    }
    return groups
  }, []), [messages])
  // กันหน้าค้างเกินจำนวนจริง เช่นแอดมินลบข้อความจนหน้าที่เปิดอยู่ไม่มีข้อมูลแล้ว
  const currentPage = Math.min(page, Math.max(1, Math.ceil(messageGroups.length / pageSize)))
  const visibleGroups = messageGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return <section className="flex min-h-screen flex-col overflow-hidden"><StorefrontHeader /><main className="mx-auto w-full max-w-[960px] flex-1 px-6 py-8 max-md:px-3.5 max-md:py-5">
    <Link to="/" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#76503a] px-5 text-xl font-extrabold text-white no-underline shadow-md shadow-[#76503a]/20 transition hover:bg-[#5f3d2b]"><ChevronLeft size={22} strokeWidth={2.75} aria-hidden="true" />กลับหน้าหลัก</Link>
    <header className="mt-5"><h1 className="m-0 font-heading text-[clamp(2rem,5vw,3rem)] leading-tight text-ink">ข้อความจากแอดมิน</h1></header>
    {!authQuery.isLoading && !authQuery.data && <p className="mt-4 mb-0 text-lg font-bold text-muted">กรุณาเข้าสู่ระบบเพื่อดูข้อความของคุณ</p>}
    {inboxQuery.isLoading && <p className="mt-4 mb-0 text-lg font-bold text-muted">กำลังโหลดข้อความ...</p>}
    {inboxQuery.isError && <p className="mt-4 mb-0 text-lg font-bold text-[#c84646]" role="alert">{inboxQuery.error.message}</p>}
    <section className="mt-5 grid gap-4" aria-label="ข้อความจากแอดมิน" aria-live="polite">
      {visibleGroups.length ? visibleGroups.map((group) => <article key={`${group.sentAt}-${group.messages[0].id}`} className="rounded-2xl border border-[#b9cbbf] bg-white p-5 shadow-sm max-md:p-4"><header className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 font-heading text-xl text-ink"><AdminAvatar avatarUrl={inboxQuery.data?.adminAvatarUrl ?? null} />แอดมิน</span><time className="text-right text-sm font-bold text-[#2f7dcc]" dateTime={group.sentAt}>{formatMessageDate(group.sentAt)}</time></header><div className="mt-4 grid gap-3">{group.messages.map((message) => <div key={message.id} className="grid gap-3">{message.imageUrl && <img className="max-h-[360px] w-auto max-w-full rounded-xl object-cover" src={message.imageUrl} alt="รูปภาพที่แอดมินแนบ" />}{message.text && <p className="m-0 whitespace-pre-wrap text-lg leading-relaxed text-[#34443a]">{message.text}</p>}</div>)}</div></article>) : inboxQuery.isSuccess && <div className="rounded-2xl border border-dashed border-[#b9cbbf] bg-white px-5 py-12 text-center"><MessageCircle className="mx-auto text-[#56805c]" size={32} aria-hidden="true" /><h2 className="mt-3 mb-0 font-heading text-2xl text-ink">ยังไม่มีข้อความ</h2><p className="mt-1 mb-0 text-lg font-semibold text-muted">เมื่อแอดมินส่งข้อความถึงคุณ จะแสดงที่หน้านี้</p></div>}
    </section>
    <StorefrontPagination currentPage={currentPage} totalItems={messageGroups.length} pageSize={pageSize} onPageChange={setPage} label="ข้อความ" />
  </main><StorefrontFooter /></section>
}
