import { Check, ChevronLeft, Clock, Info, Minus, PanelsTopLeft, Plus, Send, SunMedium, Sunset, UserRound, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import Swal from 'sweetalert2'
import { AnnouncementBar } from '@/features/customer/shared/AnnouncementBar'
import { StorefrontFooter } from '@/features/customer/shared/StorefrontFooter'
import { StorefrontHeader } from '@/features/customer/shared/StorefrontHeader'
import { products } from '@/features/customer/shared/product-data'
import { useCartStore } from '@/stores/cart-store'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type DeliveryPeriod = 'morning' | 'afternoon'

const deliveryOptions = {
  morning: { label: 'รอบเช้า', cutoff: 'สั่งได้ถึง 08:00', time: 'จัดส่ง 09:00–10:00', cutoffHour: 8, icon: SunMedium },
  afternoon: { label: 'รอบบ่าย', cutoff: 'สั่งได้ถึง 12:00', time: 'จัดส่ง 14:00–15:00', cutoffHour: 12, icon: Sunset },
}

const formatPrice = (price: number) => `${price.toLocaleString('th-TH')} บาท`
const paymentQrPlaceholder = 'LOOKCHIN_LOR_LUEAN_PAYMENT_TEMPLATE'
const enlargeAlertButtons = () => {
  const title = Swal.getTitle()
  const actions = Swal.getActions()
  if (title) {
    title.style.fontFamily = 'Sarabun, Noto Sans Thai, system-ui, sans-serif'
    title.style.fontWeight = '800'
  }
  if (actions) actions.style.marginTop = '32px'

  const buttons = [Swal.getConfirmButton(), Swal.getCancelButton()]
  buttons.filter((button): button is HTMLButtonElement => Boolean(button)).forEach((button) => {
    button.style.fontFamily = 'Sarabun, Noto Sans Thai, system-ui, sans-serif'
    button.style.fontSize = '1.25rem'
    button.style.lineHeight = '1'
  })
}

export function OrderSummaryPage() {
  const items = useCartStore((state) => state.items)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const [delivery, setDelivery] = useState<DeliveryPeriod | null>(null)
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false)

  const cartItems = useMemo(() => items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    return product ? [{ ...product, quantity: item.quantity }] : []
  }), [items])
  const itemCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems])
  const subtotal = useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems])
  const openPeriods = useMemo(() => {
    const currentHour = new Date().getHours()
    return { morning: currentHour < deliveryOptions.morning.cutoffHour, afternoon: currentHour < deliveryOptions.afternoon.cutoffHour }
  }, [])

  const confirmOrder = async () => {
    if (!delivery) {
      await Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือกรอบการสั่งซื้อ',
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        buttonsStyling: false,
        didOpen: enlargeAlertButtons,
        customClass: {
          popup: 'rounded-2xl p-8 sm:p-10',
          title: 'font-heading text-3xl text-ink sm:text-4xl',
          closeButton: 'absolute top-4 right-4 grid size-11 place-items-center rounded-full text-muted hover:bg-[#e1f3e5] hover:text-brand',
          actions: 'mt-8 gap-4',
          confirmButton: 'min-h-14 rounded-full bg-brand px-10 font-heading text-2xl font-extrabold text-white hover:bg-brand-dark',
          cancelButton: 'min-h-14 rounded-full bg-[#6b7280] px-10 font-heading text-2xl font-extrabold text-white hover:bg-[#4b5563]',
        },
      })
      return
    }

    setIsOrderConfirmed(true)
  }

  return (
    <section className="min-h-screen overflow-hidden">
      <StorefrontHeader />
      <AnnouncementBar />
      <main id="top" className="mx-auto w-full max-w-[1488px] px-6 py-8 max-md:px-3.5 max-md:py-5">
        {!isOrderConfirmed && <Link to="/" className="mb-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#76503a] px-5 text-xl font-extrabold text-white no-underline shadow-md shadow-[#76503a]/20 transition hover:bg-[#5f3d2b]">
          <ChevronLeft size={22} strokeWidth={2.75} aria-hidden="true" /> เลือกเมนูเพิ่ม
        </Link>}
        <div id="cart" className="grid grid-cols-[minmax(0,1.35fr)_minmax(320px,.95fr)] gap-6 max-lg:grid-cols-1">
          <div className="grid content-start gap-5">
            <section className="rounded-[18px] border border-[#b9cbbf] p-5 max-md:p-4" aria-labelledby="items-heading">
              <h1 id="items-heading" className="m-0 inline-flex items-center gap-2 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink"><PanelsTopLeft size={28} strokeWidth={2.5} className="text-brand" aria-hidden="true" />รายการสินค้า</h1>
              <div className="mt-5 grid gap-4">
                {cartItems.length ? cartItems.map((item) => (
                  <article key={item.id} className="relative grid grid-cols-[112px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-[#bdcbbb] bg-white p-3 max-md:grid-cols-[88px_minmax(0,1fr)] max-md:gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full text-[#f97316] transition hover:bg-[#fff1e6] active:scale-95 max-md:size-7" aria-label={`ดูรายละเอียด ${item.name}`}><Info size={22} strokeWidth={2.5} /></button>
                      </DialogTrigger>
                      <DialogContent showCloseButton={false} className="max-w-md border border-[#d8dfd5] bg-white shadow-2xl">
                        <DialogClose asChild><Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1 z-10 size-8 rounded-full text-muted hover:bg-[#e1f3e5] hover:text-brand" aria-label="ปิดหน้าต่าง"><X size={18} strokeWidth={2.5} aria-hidden="true" /></Button></DialogClose>
                        <img className="mt-4 aspect-[1.4/1] w-full rounded-lg object-cover" src={item.image} alt={item.name} />
                        <DialogHeader>
                          <DialogTitle className="font-heading text-2xl text-ink">{item.name}</DialogTitle>
                          <DialogDescription className="text-base leading-relaxed text-[#455048]">{item.description}</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-between border-t border-[#e2e8e3] pt-4">
                          <span className="text-lg font-bold text-muted">{item.stockLabel}</span>
                          <strong className="font-heading text-2xl text-brand">{formatPrice(item.price)}</strong>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <img className="size-[112px] rounded-lg object-cover max-md:size-[88px]" src={item.image} alt={item.name} />
                    <div className="min-w-0">
                      <h2 className="m-0 font-heading text-[22px] leading-tight text-ink">{item.name}</h2>
                      <p className="mt-1 mb-3 text-lg font-semibold text-muted">{formatPrice(item.price)}</p>
                      {isOrderConfirmed ? <strong className="text-2xl leading-none text-black" aria-label={`จำนวน ${item.name}: ${item.quantity}`}>{item.quantity}</strong> : <div className="inline-flex h-11 items-center rounded-full bg-[#e1f3e5] p-1" aria-label={`จำนวน ${item.name}`}>
                        <button type="button" className="grid size-9 place-items-center rounded-full bg-white text-brand shadow-sm transition hover:bg-[#f1f8f3] active:scale-95" onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label={`ลดจำนวน ${item.name}`}><Minus size={18} strokeWidth={3} /></button>
                        <strong className="grid min-w-11 place-items-center font-heading text-2xl leading-none text-black">{item.quantity}</strong>
                        <button type="button" className="grid size-9 place-items-center rounded-full bg-[#0b691d] text-white shadow-sm transition hover:bg-brand-dark active:scale-95" onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label={`เพิ่มจำนวน ${item.name}`}><Plus size={20} strokeWidth={3} /></button>
                      </div>}
                    </div>
                    <strong className="self-end whitespace-nowrap font-heading text-[22px] text-brand max-md:col-start-2">{formatPrice(item.price * item.quantity)}</strong>
                  </article>
                )) : (
                  <div className="rounded-xl border border-dashed border-[#9eb7a4] bg-white/70 px-5 py-10 text-center">
                    <p className="m-0 text-xl font-bold text-ink">ยังไม่มีสินค้าในตะกร้า</p>
                    <Link to="/" className="mt-3 inline-flex min-h-11 items-center text-lg font-bold text-brand">กลับไปเลือกเมนู</Link>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[18px] border border-[#b9cbbf] p-5 max-md:p-4" aria-labelledby="delivery-heading">
              <h2 id="delivery-heading" className="m-0 inline-flex items-center gap-2 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink"><Clock size={28} strokeWidth={2.5} className="text-brand" aria-hidden="true" />เลือกรอบการสั่งซื้อ</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 max-md:grid-cols-1">
                {(Object.entries(deliveryOptions) as [DeliveryPeriod, typeof deliveryOptions.morning][]).map(([value, option]) => {
                  const Icon = option.icon
                  const selected = delivery === value
                  const isMorning = value === 'morning'
                  const cardClass = isMorning
                    ? selected
                      ? 'border-[#77b7ed] bg-gradient-to-br from-morning to-[#f7fcff] ring-2 ring-[#77b7ed]/65 shadow-[0_0_16px_3px_#77b7ed55]'
                      : 'border-[#77b7ed] bg-gradient-to-br from-morning to-[#f7fcff] hover:-translate-y-0.5 hover:shadow-lg'
                    : selected
                      ? 'border-[#f2b866] bg-gradient-to-br from-afternoon to-[#fffaf2] ring-2 ring-[#f2b866]/65 shadow-[0_0_16px_3px_#f2b86655]'
                      : 'border-[#f2b866] bg-gradient-to-br from-afternoon to-[#fffaf2] hover:-translate-y-0.5 hover:shadow-lg'
                  const accentClass = isMorning ? 'text-[#338ad7]' : 'text-[#c88434]'
                  const isOpen = openPeriods[value]
                  return <button key={value} type="button" disabled={isOrderConfirmed || !isOpen} aria-pressed={selected} onClick={() => setDelivery((current) => current === value ? null : value)} className={`relative grid min-h-[124px] place-items-center content-center rounded-2xl border-[1.5px] px-4 py-3 text-[#1b2b31] transition disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-none ${cardClass}`}>
                    <span className={`absolute right-3 top-3 grid size-11 place-items-center rounded-full border-2 ${accentClass} ${isMorning ? 'border-[#338ad7]' : 'border-[#c88434]'} ${selected ? 'opacity-100' : 'opacity-0'}`}><Check size={20} strokeWidth={2.5} /></span>
                    <Icon size={32} className={accentClass} aria-hidden="true" />
                    <strong className="font-heading text-[22px]">{option.label}</strong>
                    <span className="text-xl font-semibold">{option.time}</span>
                    <span className="text-base font-bold">{isOpen ? option.cutoff : 'ปิดรับแล้วสำหรับวันนี้'}</span>
                  </button>
                })}
              </div>
            </section>

            <section className="rounded-[18px] border border-[#b9cbbf] bg-[#f1f8f3] p-5 max-md:p-4" aria-labelledby="recipient-heading">
              <h2 id="recipient-heading" className="m-0 inline-flex items-center gap-2 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink"><UserRound size={28} strokeWidth={2.5} className="text-brand" aria-hidden="true" />ข้อมูลผู้รับ</h2>
              <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5 text-lg max-md:grid-cols-1 max-md:gap-y-4">
                <div><dt className="text-xl font-bold text-ink">ชื่อลูกค้า</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">นายสมชาย ดีใจ</dd></div>
                <div><dt className="text-xl font-bold text-ink">เบอร์โทรศัพท์</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">0812345678</dd></div>
                <div><dt className="text-xl font-bold text-ink">สถานที่ส่งของ</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">จุดรับสินค้า B</dd></div>
                <div><dt className="text-xl font-bold text-ink">LINE ID</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">@somchai_line</dd></div>
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
            {!isOrderConfirmed && <button type="button" onClick={confirmOrder} disabled={!cartItems.length} className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#76503a] px-4 text-xl font-extrabold text-white transition hover:bg-[#5f3d2b] disabled:cursor-not-allowed disabled:opacity-50">ยืนยันการเลือกสินค้า <Send size={20} aria-hidden="true" /></button>}

            {isOrderConfirmed && <section className="rounded-[18px] border border-[#b9cbbf] bg-[#f1f8f3] p-5 max-md:p-4" aria-labelledby="payment-heading" aria-live="polite">
              <h2 id="payment-heading" className="m-0 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink">ช่องทางการชำระเงิน</h2>
              <div className="mt-5 grid place-items-center gap-4 rounded-xl border-2 border-dashed border-[#77a984] bg-white p-5 text-center">
                <div className="grid size-44 place-items-center rounded-xl border border-[#d8dfd5] bg-white p-2 shadow-inner"><QRCodeSVG value={paymentQrPlaceholder} size={152} bgColor="#ffffff" fgColor="#000000" level="M" marginSize={1} aria-label="QR Code สำหรับชำระเงิน" /></div>
                <div>
                  <p className="m-0 text-xl font-extrabold text-ink">สแกน QR Code เพื่อชำระเงิน</p>
                  <p className="mt-1 mb-0 text-lg font-bold text-brand">ยอดชำระ {formatPrice(subtotal)}</p>
                  <p className="mt-1 mb-0 text-base text-muted">ใช้แอปธนาคารเพื่อสแกนและยืนยันการชำระเงิน</p>
                </div>
              </div>
            </section>}
          </aside>
        </div>
      </main>
      <StorefrontFooter />
    </section>
  )
}
