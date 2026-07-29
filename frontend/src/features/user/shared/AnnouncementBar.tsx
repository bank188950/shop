import { Megaphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAnnouncements } from '@/features/user/shared/hooks/useAnnouncements'

export function AnnouncementBar() {
  const [showPromotion, setShowPromotion] = useState(false)
  const announcementsQuery = useAnnouncements()
  const orders = announcementsQuery.data?.orders ?? []
  const advertisements = announcementsQuery.data?.advertisements ?? []
  // สลับไปมาได้ต่อเมื่อมีข้อมูลทั้ง 2 ชุด ถ้ามีชุดเดียวก็วิ่งชุดนั้นค้างไว้
  const canSwitch = Boolean(orders.length && advertisements.length)
  const isPromotion = advertisements.length > 0 && (!orders.length || showPromotion)
  const messages = isPromotion ? advertisements : orders

  useEffect(() => {
    if (!canSwitch) return
    const timeout = window.setTimeout(() => setShowPromotion((current) => !current), showPromotion ? 16000 : 31000)
    return () => window.clearTimeout(timeout)
  }, [showPromotion, canSwitch])

  if (!messages.length) return null

  return (
    <section className="announcement-bar min-h-14 overflow-hidden bg-brand-deep text-white" aria-label={isPromotion ? 'โปรโมชันร้าน' : 'รายการสั่งซื้อล่าสุด'}>
      <div className="mx-auto flex min-h-14 w-full max-w-[1488px] items-center gap-3.5 px-6 max-md:px-3.5">
        <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-white/10 text-[#fff5c6] max-md:size-[38px]" aria-hidden="true"><Megaphone size={25} /></span>
        <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
          <div className={`announcement-track flex w-max ${isPromotion ? 'announcement-promotion-track' : 'announcement-orders-track'}`} aria-hidden="true">
            <span className={`inline-flex shrink-0 items-center px-7 ${isPromotion ? 'py-1' : ''}`}><span className={`size-[5px] rounded-full ${isPromotion ? 'bg-[#fff5c6]' : 'bg-[#b6dfaa]'}`} /></span>
            {messages.map((message) => (
              <span
                key={message}
                className={`inline-flex items-center gap-6 px-7 text-lg whitespace-nowrap after:size-[5px] after:rounded-full after:content-[''] ${isPromotion ? 'py-1 font-extrabold text-[#fff5c6] after:bg-[#fff5c6]' : 'font-bold text-white after:bg-[#b6dfaa]'}`}
              >
                {message}
              </span>
            ))}
          </div>
        </div>
        <span className="sr-only">{isPromotion ? `โปรโมชันร้าน: ${messages.join(', ')}` : `รายการสั่งซื้อล่าสุด: ${messages.join(', ')}`}</span>
      </div>
    </section>
  )
}
