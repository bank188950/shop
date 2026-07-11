import { CircleUserRound, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/stores/cart-store'

export function StorefrontHeader() {
  const itemCount = useCartStore((state) => state.items.reduce((count, item) => count + item.quantity, 0))

  return (
    <header className="relative z-10 border-b border-[#ecf0ea] bg-canvas/95">
      <div className="mx-auto flex min-h-[92px] w-full max-w-[1488px] items-center justify-between gap-6 px-6 py-3 max-md:min-h-[74px] max-md:px-[18px] max-md:py-2">
        <Link className="flex shrink-0 items-center gap-3 text-[#195a2b] no-underline max-md:gap-2" to="/" aria-label="ลูกชิ้นล้อเลื่อน หน้าหลัก">
          <img className="size-[62px] rounded-full object-cover mix-blend-multiply max-md:size-12" src="/images/logo.png" alt="โลโกลูกชิ้นล้อเลื่อน" />
          <span className="grid leading-[1.05]">
            <strong className="font-heading text-xl tracking-[-0.05em] max-md:text-base">ลูกชิ้นล้อเลื่อน</strong>
            <small className="mt-1.5 text-base font-semibold text-[#56805c] max-md:mt-0.5 max-md:text-sm">อาหารสดใหม่จากกระทะทุกวัน</small>
          </span>
        </Link>
        <div className="flex items-center gap-4 max-md:gap-1">
          <button className="relative grid size-11 place-items-center border-0 bg-transparent p-2 text-[#165c2e]" type="button" onClick={() => document.getElementById('cart')?.scrollIntoView({ behavior: 'smooth' })} aria-label={`ดูตะกร้า มี ${itemCount} รายการ`}>
            <ShoppingCart size={25} strokeWidth={2.3} />{itemCount > 0 && <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-extrabold text-white">{itemCount}</span>}
          </button>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-0 bg-[#76503a] px-5 py-2.5 text-lg font-extrabold text-white shadow-md shadow-[#76503a]/20 transition hover:bg-[#5f3d2b] max-md:px-3.5"><CircleUserRound size={18} />เข้าสู่ระบบ</button>
        </div>
      </div>
    </header>
  )
}
