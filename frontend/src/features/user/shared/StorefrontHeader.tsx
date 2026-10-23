import { ClipboardList, HousePlus, MessageCircle, ShoppingCart, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { AuthDialogs } from '@/features/user/shared/AuthDialogs'
import { useRemoveUnavailableCartItems } from '@/features/user/shared/hooks/useRemoveUnavailableCartItems'
import { useUserProducts } from '@/features/user/shared/hooks/useUserProducts'
import { useCartStore } from '@/stores/cart-store'
import { isMarkedInstalled, isRunningAsInstalledApp, promptInstall } from '@/lib/install-prompt'
import { swalBaseOptions } from '@/lib/swal'
import { homeScreenGuide } from '@/utils/home-screen'
import type { HomeScreenGuide } from '@/utils/home-screen'

// ใช้เมื่อ browser เปิดหน้าต่างติดตั้งให้ไม่ได้ จึงสอนขั้นตอนตามเครื่องและเบราว์เซอร์ที่ลูกค้าใช้อยู่
const homeScreenSteps: Record<HomeScreenGuide, { title: string, html: string }> = {
  'android-chrome': {
    title: 'เพิ่มร้านไว้ที่หน้าจอหลัก',
    html: '<ol class="m-0 inline-block list-decimal pl-7 text-left"><li>กดปุ่ม <b>⋮</b> มุมขวาบนของ Chrome</li><li class="mt-2">เลือก “ติดตั้งแอป” หรือ “เพิ่มลงในหน้าจอหลัก”</li><li class="mt-2">กด “ติดตั้ง” หรือ “เพิ่ม”</li></ol>',
  },
  'ios-safari': {
    title: 'เพิ่มร้านไว้ที่หน้าจอโฮม',
    html: '<ol class="m-0 inline-block list-decimal pl-7 text-left"><li>กดปุ่ม <b>แชร์</b> (สี่เหลี่ยมมีลูกศรชี้ขึ้น) ของ Safari</li><li class="mt-2">เลื่อนลงแล้วเลือก “เพิ่มไปยังหน้าจอโฮม”</li><li class="mt-2">กด “เพิ่ม” มุมขวาบน</li></ol>',
  },
  'open-in-chrome': {
    title: 'กรุณาเปิดเว็บนี้ใน Chrome',
    html: 'คัดลอกลิงก์ร้านไปเปิดใน Chrome<br>แล้วกดไอคอนบ้านอีกครั้ง',
  },
  'open-in-safari': {
    title: 'กรุณาเปิดเว็บนี้ใน Safari',
    html: 'คัดลอกลิงก์ร้านไปเปิดใน Safari<br>แล้วกดไอคอนบ้านอีกครั้ง',
  },
  'in-app': {
    title: 'กรุณาเปิดเว็บนี้ในเบราว์เซอร์ก่อน',
    html: 'กดปุ่ม <b>⋯</b> หรือ <b>⋮</b> แล้วเลือก “เปิดในเบราว์เซอร์”<br>Android ให้เปิดใน Chrome, iPhone ให้เปิดใน Safari<br>จากนั้นกดไอคอนบ้านอีกครั้ง',
  },
  'android-desktop-mode': {
    title: 'กรุณาปิดโหมดเว็บไซต์เวอร์ชันเดสก์ท็อป',
    html: 'กดปุ่ม <b>⋮</b> มุมขวาบนของ Chrome<br>แล้วเอาติ๊กออกที่ “เว็บไซต์เวอร์ชันเดสก์ท็อป”<br>จากนั้นกดไอคอนบ้านอีกครั้ง',
  },
  desktop: {
    title: 'เพิ่มได้เฉพาะบนโทรศัพท์มือถือ',
    html: 'เปิดเว็บร้านบนโทรศัพท์<br>แล้วกดไอคอนบ้านเพื่อเพิ่มร้านไว้ที่หน้าจอหลัก',
  },
}

// Android ที่ browser พร้อมแล้วจะเด้งหน้าต่างติดตั้งของระบบ กดยืนยันครั้งเดียวได้ไอคอนเลย
// ติดตั้งแล้ว Chrome ไม่ให้ติดตั้งซ้ำ จึงบอกว่าเพิ่มไว้แล้ว ที่เหลือสอนวิธีแทน
async function addToHomeScreen() {
  if (await promptInstall()) return
  const steps = isMarkedInstalled()
    ? { title: 'เพิ่มร้านไว้ที่หน้าจอหลักแล้ว', html: 'เปิดร้านได้จากไอคอนบนหน้าจอหลักของโทรศัพท์' }
    : homeScreenSteps[homeScreenGuide(navigator.userAgent, navigator.maxTouchPoints)]
  void Swal.fire({ ...swalBaseOptions, icon: 'info', title: steps.title, html: steps.html, showCancelButton: false, confirmButtonText: 'ตกลง' })
}

export function StorefrontHeader() {
  const items = useCartStore((state) => state.items)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInstalledApp] = useState(isRunningAsInstalledApp)
  useRemoveUnavailableCartItems()
  const cartMenuRef = useRef<HTMLDivElement>(null)
  const productsQuery = useUserProducts()
  const products = productsQuery.data
  const cartItems = useMemo(() => items.flatMap((item) => {
    const product = products?.find((candidate) => candidate.id === item.productId)
    return product ? [{ ...product, quantity: item.quantity }] : []
  }), [items, products])
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
      <div className="mx-auto flex min-h-[92px] w-full max-w-[1488px] items-center justify-between gap-6 px-6 py-3 max-lg:min-h-[74px] max-lg:gap-2 max-lg:px-[18px] max-lg:py-2 max-sm:min-h-16 max-sm:gap-1 max-sm:px-2">
        <Link className="flex min-w-0 items-center gap-3 text-[#195a2b] no-underline max-lg:gap-2 max-sm:gap-1.5" to="/" aria-label="ลูกชิ้นทอดล้อเลื่อน หน้าหลัก">
          <img className="size-[62px] rounded-full object-cover mix-blend-multiply max-lg:size-12 max-sm:size-10 max-[22.5rem]:size-8" src="/images/logo.png" alt="โลโกลูกชิ้นทอดล้อเลื่อน" />
          <span className="grid min-w-0 leading-[1.05] max-sm:max-w-32">
            <strong className="font-heading text-[22px] tracking-[-0.05em] max-lg:text-lg max-sm:truncate max-sm:text-xs max-[22.5rem]:text-[11px]">ลูกชิ้นทอดล้อเลื่อน</strong>
            <small className="mt-1.5 text-base font-semibold text-[#56805c] max-lg:mt-0.5 max-lg:text-sm max-sm:truncate max-sm:text-[9.5px]">มากกว่าคำว่าอร่อย</small>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-4 max-lg:gap-2 max-sm:gap-1.5 max-[22.5rem]:gap-1">
          {!isInstalledApp && <button type="button" onClick={addToHomeScreen} className="inline-flex size-11 items-center justify-center border-0 bg-transparent p-0 text-[#195a2b] max-lg:size-9 max-sm:size-8 max-[22.5rem]:size-7" aria-label="เพิ่มร้านไว้ที่หน้าจอหลัก"><HousePlus size={24} strokeWidth={2.3} className="max-lg:size-5" aria-hidden="true" /></button>}
          <Link to="/my-chats" className="inline-flex size-11 items-center justify-center text-[#195a2b] no-underline transition hover:shadow-none max-lg:size-9 max-sm:size-8 max-[22.5rem]:size-7" aria-label="ดูข้อความจากร้านค้า"><MessageCircle size={24} strokeWidth={2.3} className="max-lg:size-5" aria-hidden="true" /></Link>
          <Link to="/my-orders" className="inline-flex size-11 items-center justify-center text-[#195a2b] no-underline transition hover:shadow-none max-lg:size-9 max-sm:size-8 max-[22.5rem]:size-7" aria-label="ออเดอร์ของฉัน"><ClipboardList size={24} strokeWidth={2.3} className="max-lg:size-5" aria-hidden="true" /></Link>
          <div ref={cartMenuRef} className="relative">
            <button className="relative grid size-11 place-items-center border-0 bg-transparent p-2 text-[#165c2e] max-sm:p-0 max-lg:size-9 max-sm:size-8 max-[22.5rem]:size-7" type="button" onClick={() => setIsCartOpen((open) => !open)} aria-label={`${isCartOpen ? 'ปิด' : 'เปิด'}ตะกร้า มี ${itemCount} รายการ`} aria-expanded={isCartOpen} aria-controls="header-cart-menu">
              <ShoppingCart size={25} strokeWidth={2.3} className="max-lg:size-5" />{itemCount > 0 && <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-extrabold text-white max-sm:min-h-4 max-sm:min-w-4 max-sm:text-[10px]">{itemCount}</span>}
            </button>
            {isCartOpen && <div id="header-cart-menu" className="absolute right-0 top-[calc(100%+10px)] z-20 w-[min(360px,calc(100vw-28px))] rounded-2xl border border-[#b9cbbf] bg-canvas p-4 shadow-xl shadow-[#183326]/15 max-sm:fixed max-sm:inset-x-3.5 max-sm:top-[calc(env(safe-area-inset-top)+4rem)] max-sm:w-auto" role="dialog" aria-label="ตะกร้าสินค้า">
              <h2 className="m-0 font-heading text-xl text-ink">สินค้าที่สั่ง</h2>
              <button type="button" onClick={() => setIsCartOpen(false)} className="group absolute right-2 top-2 grid size-11 place-items-center rounded-full text-muted transition hover:text-brand" aria-label="ปิดตะกร้าสินค้า"><span className="grid size-9 place-items-center rounded-full transition group-hover:bg-[#e1f3e5]"><X size={18} strokeWidth={2.5} aria-hidden="true" /></span></button>
              {cartItems.length ? <>
                <ul className="mt-3 mb-0 grid list-none gap-3 p-0">
                  {cartItems.map((item) => <li key={item.id} className="flex items-center gap-3">
                    {item.imageUrl && <img className="size-12 rounded-lg object-cover" src={item.imageUrl} alt="" />}
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
          {/* ไอคอนบนมือถือชิดกันแบบ gap-0 จึงแยกปุ่มสมาชิกออกมาให้มีระยะของตัวเอง */}
          <div className="flex items-center gap-4 max-lg:ml-3 max-lg:gap-3 max-sm:gap-2.5 max-[22.5rem]:ml-2 max-[22.5rem]:gap-2"><AuthDialogs /></div>
        </div>
      </div>
    </header>
  )
}
