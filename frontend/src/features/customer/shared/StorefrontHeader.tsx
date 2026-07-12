import { CircleUserRound, ShoppingCart, UserPlus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { products } from '@/features/customer/shared/product-data'
import { useCartStore } from '@/stores/cart-store'

export function StorefrontHeader() {
  const items = useCartStore((state) => state.items)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartMenuRef = useRef<HTMLDivElement>(null)
  const cartItems = useMemo(() => items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    return product ? [{ ...product, quantity: item.quantity }] : []
  }), [items])
  const itemCount = useMemo(() => cartItems.reduce((count, item) => count + item.quantity, 0), [cartItems])
  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems])

  useEffect(() => {
    const closeCartMenu = (event: MouseEvent) => {
      if (!cartMenuRef.current?.contains(event.target as Node)) setIsCartOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCartOpen(false)
    }
    document.addEventListener('mousedown', closeCartMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeCartMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

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
          <div ref={cartMenuRef} className="relative">
            <button className="relative grid size-11 place-items-center border-0 bg-transparent p-2 text-[#165c2e]" type="button" onClick={() => setIsCartOpen((open) => !open)} aria-label={`${isCartOpen ? 'ปิด' : 'เปิด'}ตะกร้า มี ${itemCount} รายการ`} aria-expanded={isCartOpen} aria-controls="header-cart-menu">
              <ShoppingCart size={25} strokeWidth={2.3} />{itemCount > 0 && <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-extrabold text-white">{itemCount}</span>}
            </button>
            {isCartOpen && <div id="header-cart-menu" className="absolute right-0 top-[calc(100%+10px)] z-20 w-[min(360px,calc(100vw-28px))] rounded-2xl border border-[#b9cbbf] bg-canvas p-4 shadow-xl shadow-[#183326]/15" role="dialog" aria-label="ตะกร้าสินค้า">
              <h2 className="m-0 font-heading text-xl text-ink">สินค้าที่สั่ง</h2>
              <button type="button" onClick={() => setIsCartOpen(false)} className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-muted transition hover:bg-[#e1f3e5] hover:text-brand" aria-label="ปิดตะกร้าสินค้า"><X size={22} strokeWidth={2.5} aria-hidden="true" /></button>
              {cartItems.length ? <>
                <ul className="mt-3 mb-0 grid list-none gap-3 p-0">
                  {cartItems.map((item) => <li key={item.id} className="flex items-center gap-3">
                    <img className="size-12 rounded-lg object-cover" src={item.image} alt="" />
                    <span className="min-w-0 flex-1 truncate font-bold text-ink">{item.name}</span>
                    <span className="shrink-0 text-base font-bold text-muted">x {item.quantity}</span>
                  </li>)}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-[#d6e1d7] pt-3 text-lg">
                  <span className="font-bold text-ink">ยอดชำระสุทธิ</span>
                  <strong className="font-heading text-xl text-brand">{total.toLocaleString('th-TH')} บาท</strong>
                </div>
                <Link to="/order-summary" onClick={() => setIsCartOpen(false)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#76503a] px-4 text-lg font-extrabold text-white no-underline transition hover:bg-[#5f3d2b]">ดูรายการสั่งซื้อ</Link>
              </> : <p className="mt-3 mb-0 text-base font-semibold text-muted">ยังไม่มีสินค้าในตะกร้า</p>}
            </div>}
          </div>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-0 bg-[#76503a] px-5 py-2.5 text-lg font-extrabold text-white shadow-md shadow-[#76503a]/20 transition hover:bg-[#5f3d2b] max-md:px-3.5 max-sm:size-11 max-sm:px-0" type="button" aria-label="สมัครสมาชิก"><UserPlus size={18} aria-hidden="true" /><span className="max-sm:hidden">สมัครสมาชิก</span></button>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-0 bg-[#76503a] px-5 py-2.5 text-lg font-extrabold text-white shadow-md shadow-[#76503a]/20 transition hover:bg-[#5f3d2b] max-md:px-3.5 max-sm:size-11 max-sm:px-0" type="button" aria-label="เข้าสู่ระบบ"><CircleUserRound size={18} aria-hidden="true" /><span className="max-sm:hidden">เข้าสู่ระบบ</span></button>
        </div>
      </div>
    </header>
  )
}
