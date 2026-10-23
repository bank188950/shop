import { ArrowRight, ChevronLeft, ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cart-store'
import { useUserProducts } from '@/features/user/shared/hooks/useUserProducts'

// checkout = ปุ่มไปหน้าสรุปคำสั่งซื้อ (หน้าแรก), continue-shopping = ปุ่มกลับไปเลือกเมนูที่หน้าแรก (หน้าสรุปคำสั่งซื้อ)
export function StickyCart({ variant = 'checkout' }: { variant?: 'checkout' | 'continue-shopping' }) {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const productsQuery = useUserProducts()
  const products = productsQuery.data
  const itemCount = useMemo(() => items.reduce((count, item) => count + item.quantity, 0), [items])
  const total = useMemo(() => items.reduce((sum, item) => sum + (products?.find((product) => product.id === item.productId)?.price ?? 0) * item.quantity, 0), [items, products])

  return (
    <aside id={variant === 'checkout' ? 'cart' : undefined} className="fixed bottom-5 left-1/2 z-20 flex w-[min(100%-48px,1440px)] -translate-x-1/2 items-center justify-between gap-5 rounded-[20px] bg-brand-deep py-3 pr-3.5 pl-[22px] text-white shadow-2xl shadow-brand-deep/30 max-md:bottom-2.5 max-md:w-[calc(100%-22px)] max-md:gap-2 max-md:rounded-[17px] max-md:px-3.5 max-md:py-2.5" aria-label="สรุปตะกร้าสินค้า">
      <div className="flex items-center gap-3 max-md:gap-2"><span className="relative flex w-11 items-center justify-center max-md:w-[34px]"><ShoppingCart size={29} className="text-[#e1f3e5] max-md:size-[25px]" />{itemCount > 0 && <b className="absolute -top-1 -right-0.5 grid min-h-[22px] min-w-[22px] place-items-center rounded-full border-2 border-brand-deep bg-[#e1f3e5] px-1 text-base text-brand max-md:text-xs">{itemCount}</b>}</span><div className="grid leading-tight"><strong className="text-lg text-[#e1f3e5] max-md:text-base">{itemCount ? `${itemCount} รายการ` : 'ยังไม่มีสินค้าในตะกร้า'}</strong><small className="mt-1 text-base text-[#e1f3e5] max-md:text-xs">{itemCount ? `รวม ${total.toLocaleString('th-TH')} บาท` : 'เลือกเมนูที่ชอบได้เลย'}</small></div></div>
      <div><button type="button" className="inline-flex min-w-[220px] items-center justify-center gap-4 rounded-full border-0 bg-[#e1f3e5] px-4 py-3.5 text-lg font-extrabold text-brand shadow-md transition hover:bg-[#c3e4ca] focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-[#e1f3e5]/45 disabled:text-brand-deep/70 disabled:shadow-none max-md:min-w-[130px] max-md:gap-1.5 max-md:px-2.5 max-md:py-3 max-md:text-sm" disabled={variant === 'checkout' && !itemCount} onClick={() => navigate(variant === 'checkout' ? '/order-summary' : '/')}>{variant === 'checkout' ? <>ดูรายการสั่งซื้อ <ArrowRight size={21} className="max-md:size-4" /></> : <><ChevronLeft size={21} className="max-md:size-4" /> สั่งเมนูเพิ่ม</>}</button></div>
    </aside>
  )
}
