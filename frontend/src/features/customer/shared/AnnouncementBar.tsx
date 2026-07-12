import { Megaphone } from 'lucide-react'
import { useEffect, useState } from 'react'

const recentOrders = [
  'คุณอร สั่งลูกชิ้นหมูพริกขี้หนู 5 ไม้',
  'คุณเอก สั่งลูกชิ้นเนื้อเอ็น 2 ไม้',
  'คุณฝน สั่งน้ำเก๊กฮวยเย็น 3 แก้ว',
]
const promotion = 'โปรโมชั่น ซื้อลูกชิ้น 10 ไม้ แถมฟรี 1 ไม้'

export function AnnouncementBar() {
  const [showPromotion, setShowPromotion] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowPromotion((current) => !current), showPromotion ? 16000 : 31000)
    return () => window.clearTimeout(timeout)
  }, [showPromotion])

  return (
    <section className="announcement-bar min-h-14 overflow-hidden bg-brand-deep text-white" aria-label={showPromotion ? 'โปรโมชันร้าน' : 'รายการสั่งซื้อล่าสุด'}>
      <div className="mx-auto flex min-h-14 w-full max-w-[1488px] items-center gap-3.5 px-6 max-md:px-3.5">
        <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-white/10 text-[#fff5c6] max-md:size-[38px]" aria-hidden="true"><Megaphone size={25} /></span>
        <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
          {showPromotion ? (
            <div className="announcement-track announcement-promotion-track flex w-max" aria-hidden="true">
              <span className="inline-flex items-center gap-6 px-7 py-1 text-lg font-extrabold whitespace-nowrap text-[#fff5c6]"><span className="size-[5px] rounded-full bg-[#fff5c6]" aria-hidden="true" />{promotion}<span className="size-[5px] rounded-full bg-[#fff5c6]" aria-hidden="true" /></span>
            </div>
          ) : (
            <div className="announcement-track announcement-orders-track flex w-max" aria-hidden="true">
              {recentOrders.map((order) => <span className="inline-flex items-center gap-6 px-7 text-lg font-bold whitespace-nowrap text-white after:size-[5px] after:rounded-full after:bg-[#b6dfaa] after:content-['']" key={order}>{order}</span>)}
            </div>
          )}
        </div>
        <span className="sr-only">{showPromotion ? promotion : `รายการสั่งซื้อล่าสุด: ${recentOrders.join(', ')}`}</span>
      </div>
    </section>
  )
}
