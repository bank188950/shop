import { Megaphone } from 'lucide-react'

const recentOrders = [
  'คุณอร สั่งลูกชิ้นหมูพริกขี้หนู 5 ไม้',
  'คุณเอก สั่งลูกชิ้นเนื้อเอ็น 2 ไม้',
  'คุณฝน สั่งน้ำเก๊กฮวยเย็น 3 แก้ว',
]

export function AnnouncementBar() {
  return (
    <section className="min-h-14 overflow-hidden bg-brand-deep text-white" aria-label="รายการสั่งซื้อล่าสุด">
      <div className="mx-auto flex min-h-14 w-full max-w-[1488px] items-center gap-3.5 px-6 max-md:px-3.5">
        <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-white/10 text-[#fff5c6] max-md:size-[38px]" aria-hidden="true"><Megaphone size={25} /></span>
        <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
          <div className="announcement-track flex w-max animate-[announcement-scroll_30s_linear_infinite]" aria-hidden="true">
            {[...recentOrders, ...recentOrders].map((order, index) => <span className="inline-flex items-center gap-6 px-7 text-lg font-bold whitespace-nowrap after:size-[5px] after:rounded-full after:bg-[#b6dfaa] after:content-['']" key={`${order}-${index}`}>{order}</span>)}
          </div>
        </div>
        <span className="sr-only">รายการสั่งซื้อล่าสุด: {recentOrders.join(', ')}</span>
      </div>
    </section>
  )
}
