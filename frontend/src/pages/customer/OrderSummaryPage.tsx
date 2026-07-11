import { Check, ChevronLeft, CloudUpload, CreditCard, Minus, Plus, QrCode, SunMedium, Sunset } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnnouncementBar } from '@/features/customer/shared/AnnouncementBar'
import { StorefrontFooter } from '@/features/customer/shared/StorefrontFooter'
import { StorefrontHeader } from '@/features/customer/shared/StorefrontHeader'
import { products } from '@/features/customer/shared/product-data'
import { useCartStore } from '@/stores/cart-store'

type PaymentMethod = 'transfer' | 'online'
type DeliveryPeriod = 'morning' | 'afternoon'

const deliveryOptions = {
  morning: { label: 'รอบเช้า', time: '08:00 - 11:00', icon: SunMedium },
  afternoon: { label: 'รอบบ่าย', time: '14:00 - 17:00', icon: Sunset },
}

const formatPrice = (price: number) => `฿${price.toLocaleString('th-TH')}`

export function OrderSummaryPage() {
  const items = useCartStore((state) => state.items)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const [delivery, setDelivery] = useState<DeliveryPeriod>('morning')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer')
  const [slipName, setSlipName] = useState('')
  const uploadInput = useRef<HTMLInputElement>(null)

  const cartItems = useMemo(() => items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    return product ? [{ ...product, quantity: item.quantity }] : []
  }), [items])
  const itemCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems])
  const subtotal = useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems])

  return (
    <section className="min-h-screen overflow-hidden">
      <StorefrontHeader />
      <AnnouncementBar />
      <main id="top" className="mx-auto w-full max-w-[1488px] px-6 py-8 max-md:px-3.5 max-md:py-5">
        <Link to="/" className="mb-5 inline-flex min-h-11 items-center gap-2 text-lg font-bold text-brand no-underline hover:text-brand-dark">
          <ChevronLeft size={22} aria-hidden="true" /> เลือกเมนูเพิ่ม
        </Link>
        <div id="cart" className="grid grid-cols-[minmax(0,1.35fr)_minmax(320px,.95fr)] gap-6 max-lg:grid-cols-1">
          <div className="grid content-start gap-5">
            <section className="rounded-[18px] border border-[#b9cbbf] bg-morning p-5 max-md:p-4" aria-labelledby="items-heading">
              <h1 id="items-heading" className="m-0 font-heading text-[clamp(2rem,4vw,3rem)] leading-tight text-ink">รายการสินค้า</h1>
              <div className="mt-5 grid gap-4">
                {cartItems.length ? cartItems.map((item) => (
                  <article key={item.id} className="grid grid-cols-[112px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-[#bdcbbb] bg-white p-3 max-md:grid-cols-[88px_minmax(0,1fr)] max-md:gap-3">
                    <img className="size-[112px] rounded-lg object-cover max-md:size-[88px]" src={item.image} alt={item.name} />
                    <div className="min-w-0">
                      <h2 className="m-0 font-heading text-xl leading-tight text-ink">{item.name}</h2>
                      <p className="mt-1 mb-3 text-base font-semibold text-muted">ราคา {formatPrice(item.price)}</p>
                      <div className="inline-flex h-11 items-center rounded-full bg-[#d6ebf8] p-1" aria-label={`จำนวน ${item.name}`}>
                        <button type="button" className="grid size-9 place-items-center rounded-full bg-white text-brand shadow-sm transition hover:bg-[#eff9ff] active:scale-95" onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label={`ลดจำนวน ${item.name}`}><Minus size={18} strokeWidth={3} /></button>
                        <strong className="grid min-w-11 place-items-center font-heading text-2xl leading-none text-black">{item.quantity}</strong>
                        <button type="button" className="grid size-9 place-items-center rounded-full bg-[#0b691d] text-white shadow-sm transition hover:bg-brand-dark active:scale-95" onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label={`เพิ่มจำนวน ${item.name}`}><Plus size={20} strokeWidth={3} /></button>
                      </div>
                    </div>
                    <strong className="self-end whitespace-nowrap font-heading text-xl text-brand max-md:col-start-2">{formatPrice(item.price * item.quantity)}</strong>
                  </article>
                )) : (
                  <div className="rounded-xl border border-dashed border-[#9eb7a4] bg-white/70 px-5 py-10 text-center">
                    <p className="m-0 text-xl font-bold text-ink">ยังไม่มีสินค้าในตะกร้า</p>
                    <Link to="/" className="mt-3 inline-flex min-h-11 items-center text-lg font-bold text-brand">กลับไปเลือกเมนู</Link>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[18px] border border-[#b9cbbf] bg-morning p-5 max-md:p-4" aria-labelledby="delivery-heading">
              <h2 id="delivery-heading" className="m-0 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink">เลือกรอบการจัดส่ง</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 max-md:grid-cols-1">
                {(Object.entries(deliveryOptions) as [DeliveryPeriod, typeof deliveryOptions.morning][]).map(([value, option]) => {
                  const Icon = option.icon
                  const selected = delivery === value
                  return <button key={value} type="button" aria-pressed={selected} onClick={() => setDelivery(value)} className={`relative grid min-h-[92px] place-items-center rounded-xl border-2 px-4 py-3 transition ${selected ? 'border-[#166d29] bg-brand text-white shadow-md' : 'border-[#bdcbbb] bg-white text-[#455048] hover:border-brand'}`}>
                    {selected && <Check className="absolute right-3 top-3" size={20} aria-hidden="true" />}
                    <Icon size={27} aria-hidden="true" />
                    <strong className="font-heading text-xl">{option.label}</strong>
                    <span className="text-base">{option.time}</span>
                  </button>
                })}
              </div>
            </section>

            <section className="rounded-[18px] border border-[#b9cbbf] bg-morning p-5 max-md:p-4" aria-labelledby="recipient-heading">
              <h2 id="recipient-heading" className="m-0 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink">ข้อมูลผู้รับ</h2>
              <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5 text-lg max-md:grid-cols-1 max-md:gap-y-4">
                <div><dt className="text-base font-bold text-[#455048]">ชื่อจริง</dt><dd className="mt-1.5 ml-0 font-bold">นายสมชาย ดีใจ</dd></div>
                <div><dt className="text-base font-bold text-[#455048]">ชื่อเล่น</dt><dd className="mt-1.5 ml-0 font-bold">ชาย</dd></div>
                <div><dt className="text-base font-bold text-[#455048]">เบอร์โทรศัพท์</dt><dd className="mt-1.5 ml-0 font-bold">081-234-5678</dd></div>
                <div><dt className="text-base font-bold text-[#455048]">LINE ID</dt><dd className="mt-1.5 ml-0 font-bold">@somchai_line</dd></div>
                <div className="col-span-full"><dt className="text-base font-bold text-[#455048]">ที่อยู่จัดส่ง / ปักหมุด</dt><dd className="mt-1.5 ml-0 font-bold">123 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400</dd></div>
              </dl>
            </section>
          </div>

          <aside className="grid content-start gap-4" aria-label="สรุปและชำระเงิน">
            <section className="rounded-[18px] bg-[#0f6b1e] p-6 text-white shadow-lg shadow-[#0f6b1e]/20 max-md:p-5" aria-labelledby="summary-heading">
              <h2 id="summary-heading" className="m-0 font-heading text-[clamp(1.5rem,3vw,2rem)]">สรุปยอดสั่งซื้อ</h2>
              <dl className="mt-5 grid gap-3 text-lg">
                <div className="flex justify-between gap-4"><dt>รายการทั้งหมด</dt><dd className="m-0 font-bold">{itemCount} รายการ</dd></div>
                <div className="flex justify-between gap-4"><dt>จำนวนไม้รวม</dt><dd className="m-0 font-bold">{itemCount} ไม้</dd></div>
                <div className="flex justify-between gap-4"><dt>ค่าจัดส่ง</dt><dd className="m-0 font-bold">ฟรี</dd></div>
              </dl>
              <div className="mt-5 flex items-center justify-between border-t border-white/25 pt-5"><span className="font-heading text-xl">ยอดชำระสุทธิ</span><strong className="font-heading text-[32px]">{formatPrice(subtotal)}</strong></div>
            </section>

            <section className="rounded-[18px] border border-[#b9cbbf] bg-morning p-5 max-md:p-4" aria-labelledby="payment-heading">
              <h2 id="payment-heading" className="m-0 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink">ช่องทางการชำระเงิน</h2>
              <div className="mt-4 grid grid-cols-2 rounded-xl bg-[#d3e8f8] p-1" role="tablist" aria-label="วิธีชำระเงิน">
                <button type="button" role="tab" aria-selected={paymentMethod === 'transfer'} onClick={() => setPaymentMethod('transfer')} className={`min-h-11 rounded-lg px-2 text-base font-bold transition ${paymentMethod === 'transfer' ? 'bg-white text-brand shadow-sm' : 'text-[#455048]'}`}>โอนเงิน/สลิป</button>
                <button type="button" role="tab" aria-selected={paymentMethod === 'online'} onClick={() => setPaymentMethod('online')} className={`min-h-11 rounded-lg px-2 text-base font-bold transition ${paymentMethod === 'online' ? 'bg-white text-brand shadow-sm' : 'text-[#455048]'}`}>ออนไลน์</button>
              </div>

              {paymentMethod === 'transfer' ? <div className="mt-4 grid gap-4">
                <div className="flex items-center gap-4 rounded-xl border border-dashed border-[#77a984] bg-white p-4">
                  <div className="grid size-[72px] shrink-0 place-items-center rounded-lg bg-[#eef2ed] text-brand"><QrCode size={50} aria-label="QR สำหรับชำระเงิน" /></div>
                  <p className="m-0 text-base leading-relaxed text-ink"><strong className="text-brand">ธนาคารกสิกรไทย (K-Bank)</strong><br />เลขบัญชี: 123-4-56789-0<br />ชื่อ: นายลูกชิ้น ล้อเลื่อน</p>
                </div>
                <input ref={uploadInput} className="sr-only" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event) => setSlipName(event.target.files?.[0]?.name ?? '')} />
                <button type="button" onClick={() => uploadInput.current?.click()} className="grid min-h-[126px] place-items-center rounded-xl border-2 border-dashed border-[#b8c5aa] bg-white/55 px-4 py-5 text-center text-[#455048] hover:border-brand hover:bg-white">
                  <CloudUpload size={35} className="text-brand" aria-hidden="true" />
                  <span className="mt-2 font-bold text-ink">{slipName || 'อัปโหลดสลิปโอน'}</span>
                  <small className="text-base">JPG, PNG หรือ PDF (ไม่เกิน 5MB)</small>
                </button>
              </div> : <div className="mt-4 rounded-xl border border-dashed border-[#b8c5aa] bg-white/60 p-5 text-center"><CreditCard size={34} className="mx-auto text-brand" aria-hidden="true" /><p className="mt-2 mb-0 text-lg font-bold text-ink">ชำระเงินออนไลน์</p><p className="mt-1 mb-0 text-base text-muted">เลือกช่องทางนี้เมื่อพร้อมชำระเงิน</p></div>}
              <button type="button" disabled={!cartItems.length} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#76503a] px-4 text-lg font-extrabold text-white transition hover:bg-[#5f3d2b] disabled:cursor-not-allowed disabled:opacity-50">ยืนยันรายการสั่งซื้อ</button>
            </section>
          </aside>
        </div>
      </main>
      <StorefrontFooter />
    </section>
  )
}
