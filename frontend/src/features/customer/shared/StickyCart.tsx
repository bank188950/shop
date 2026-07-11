import { ArrowRight, ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { products } from './product-data'

export function StickyCart() {
  const items = useCartStore((state) => state.items)
  const itemCount = useMemo(() => items.reduce((count, item) => count + item.quantity, 0), [items])
  const total = useMemo(() => items.reduce((sum, item) => sum + (products.find((product) => product.id === item.productId)?.price ?? 0) * item.quantity, 0), [items])

  return (
    <aside id="cart" className="fixed bottom-5 left-1/2 z-20 flex w-[min(100%-48px,1440px)] -translate-x-1/2 items-center justify-between gap-5 rounded-[20px] bg-brand-deep py-3 pr-3.5 pl-[22px] text-white shadow-2xl shadow-brand-deep/30 max-md:bottom-2.5 max-md:w-[calc(100%-22px)] max-md:gap-2 max-md:rounded-[17px] max-md:px-3.5 max-md:py-2.5" aria-label="สรุปตะกร้าสินค้า">
      <div className="flex items-center gap-3 max-md:gap-2"><span className="relative flex w-11 items-center justify-center max-md:w-[34px]"><ShoppingCart size={29} className="max-md:size-[25px]" />{itemCount > 0 && <b className="absolute -top-1 -right-0.5 grid min-h-[22px] min-w-[22px] place-items-center rounded-full border-2 border-brand-deep bg-white px-1 text-base text-brand max-md:text-xs">{itemCount}</b>}</span><div className="grid leading-tight"><strong className="text-lg max-md:text-base">{itemCount ? `${itemCount} รายการ` : 'ยังไม่มีสินค้าในตะกร้า'}</strong><small className="mt-1 text-base text-[#e1f0df] max-md:text-xs">{itemCount ? `รวม ${total} บาท` : 'เลือกเมนูที่ชอบได้เลย'}</small></div></div>
      <div><button type="button" className="inline-flex min-w-[220px] items-center justify-center gap-4 rounded-full border-0 bg-[#76503a] px-4 py-3.5 text-lg font-extrabold text-white hover:bg-[#5f3d2b] disabled:cursor-not-allowed disabled:bg-[#76503a]/45 disabled:text-white/80 max-md:min-w-[130px] max-md:gap-1.5 max-md:px-2.5 max-md:py-3 max-md:text-sm" disabled={!itemCount}>ดูรายการสั่งซื้อ <ArrowRight size={21} className="max-md:size-4" /></button></div>
    </aside>
  )
}
