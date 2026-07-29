import { Check, ChevronLeft, Clock, Download, Info, Minus, PanelsTopLeft, Plus, Send, SunMedium, Sunset, UserRound, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import Swal from 'sweetalert2'
import type { SweetAlertOptions } from 'sweetalert2'
import { AnnouncementBar } from '@/features/user/shared/AnnouncementBar'
import { StorefrontFooter } from '@/features/user/shared/StorefrontFooter'
import { StorefrontHeader } from '@/features/user/shared/StorefrontHeader'
import { useUserProducts } from '@/features/user/shared/hooks/useUserProducts'
import { productStockLabel } from '@/features/user/shared/utils/product-labels'
import { useUserAuth } from '@/features/user/auth/hooks/useUserAuth'
import { useCreateUserOrder, useDeliverySettings, usePayUserOrder } from '@/features/user/order/hooks/useUserOrders'
import { orderStatusClass, orderStatusLabel } from '@/features/user/order/utils/order-labels'
import { downloadPaymentQr, paymentQrValue } from '@/features/user/order/utils/payment-qr'
import type { UserOrder, DeliveryPeriod } from '@/api/user/orders'
import type { UserProduct } from '@/api/user/products'
import { useCartStore } from '@/stores/cart-store'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type CartLine = UserProduct & { quantity: number }

const deliveryOptions = {
  morning: { label: 'รอบเช้า', icon: SunMedium },
  afternoon: { label: 'รอบบ่าย', icon: Sunset },
}

const formatPrice = (price: number) => `${price.toLocaleString('th-TH')} บาท`
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

type StockShortage = { name: string, remaining: number, unitName: string }

/** backend ตอบ 409 พร้อมรายการของที่ไม่พอทั้งหมด เพื่อให้ลูกค้าแก้ตะกร้าจบในรอบเดียว */
const stockShortagesOf = (error: unknown): StockShortage[] => {
  const shortages = (error as { data?: { shortages?: StockShortage[] } })?.data?.shortages
  return Array.isArray(shortages) ? shortages : []
}

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character] ?? character)

const swalBaseOptions: SweetAlertOptions = {
  showCancelButton: true,
  showCloseButton: true,
  cancelButtonText: 'ยกเลิก',
  buttonsStyling: false,
  didOpen: enlargeAlertButtons,
  customClass: {
    popup: 'rounded-2xl p-8 sm:p-10',
    title: 'font-heading text-3xl text-ink sm:text-4xl',
    htmlContainer: 'mt-3 text-xl font-bold text-[#455048]',
    closeButton: 'absolute top-4 right-4 grid size-11 place-items-center rounded-full text-muted hover:bg-[#e1f3e5] hover:text-brand',
    actions: 'mt-8 gap-4',
    confirmButton: 'min-h-14 rounded-full bg-brand px-10 font-heading text-2xl font-extrabold text-white hover:bg-brand-dark',
    cancelButton: 'min-h-14 rounded-full bg-[#6b7280] px-10 font-heading text-2xl font-extrabold text-white hover:bg-[#4b5563]',
  },
}

const alertStockShortages = (shortages: StockShortage[]) => Swal.fire({
  ...swalBaseOptions,
  icon: 'error',
  title: 'สินค้าที่มีไม่พอกับที่สั่ง',
  html: `<ol class="m-0 inline-block list-decimal pl-7 text-left">${shortages.map((item) => `<li class="mt-2 first:mt-0">${escapeHtml(item.name)} เหลือ ${item.remaining} ${escapeHtml(item.unitName)}</li>`).join('')}</ol>`,
  confirmButtonText: 'ตกลง',
})

export function OrderSummaryPage() {
  const items = useCartStore((state) => state.items)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const clearCart = useCartStore((state) => state.clear)
  const [delivery, setDelivery] = useState<DeliveryPeriod | null>(null)
  const [order, setOrder] = useState<UserOrder | null>(null)
  const [confirmedItems, setConfirmedItems] = useState<CartLine[]>([])
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const productsQuery = useUserProducts()
  const authQuery = useUserAuth()
  const settingsQuery = useDeliverySettings()
  const createOrderMutation = useCreateUserOrder()
  const payOrderMutation = usePayUserOrder()
  const user = authQuery.data
  const products = productsQuery.data
  const isOrderConfirmed = Boolean(order)
  const cartItems = useMemo(() => items.flatMap((item) => {
    const product = products?.find((candidate) => candidate.id === item.productId)
    return product ? [{ ...product, quantity: item.quantity }] : []
  }), [items, products])
  const displayItems = order ? confirmedItems : cartItems
  const itemCount = useMemo(() => displayItems.reduce((total, item) => total + item.quantity, 0), [displayItems])
  const subtotal = order?.totalAmount ?? displayItems.reduce((total, item) => total + item.price * item.quantity, 0)

  const alert = (title: string, icon: 'warning' | 'error' = 'warning') => Swal.fire({ ...swalBaseOptions, icon, title, confirmButtonText: 'ตกลง' })

  const confirmOrder = async () => {
    if (!user) {
      await alert('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ')
      return
    }
    if (!user.locationId) {
      await alert('กรุณาเลือกสถานที่ส่งของในหน้าจัดการผู้ใช้ก่อน')
      return
    }
    if (!delivery) {
      await alert('กรุณาเลือกรอบการสั่งซื้อ')
      return
    }

    // เช็คสต็อกจากข้อมูลที่โหลดมาก่อน ลูกค้าจะได้รู้ว่าของไม่พอตั้งแต่ยังไม่ต้องกดยืนยัน
    const cartShortages = cartItems
      .filter((item) => item.stockQuantity < item.quantity)
      .map((item) => ({ name: item.name, remaining: item.stockQuantity, unitName: item.unitName }))
    if (cartShortages.length) {
      await alertStockShortages(cartShortages)
      return
    }

    const confirmed = await Swal.fire({
      ...swalBaseOptions,
      icon: 'warning',
      title: 'ยืนยันการสั่งซื้อ',
      text: `${itemCount} รายการ · ${deliveryOptions[delivery].label} · ยอดชำระ ${formatPrice(subtotal)}`,
      confirmButtonText: 'ยืนยันสั่งซื้อ',
    })
    if (!confirmed.isConfirmed) return

    try {
      const createdOrder = await createOrderMutation.mutateAsync({
        locationId: user.locationId,
        deliveryPeriod: delivery,
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
      })
      setConfirmedItems(cartItems)
      setOrder(createdOrder)
      clearCart()
    } catch (error) {
      const shortages = stockShortagesOf(error)
      if (shortages.length) {
        await alertStockShortages(shortages)
        return
      }
      await alert(error instanceof Error ? error.message : 'ไม่สามารถสร้างคำสั่งซื้อได้', 'error')
    }
  }

  const payOrder = async () => {
    if (!order) return
    try {
      setOrder(await payOrderMutation.mutateAsync(order.id))
    } catch (error) {
      await alert(error instanceof Error ? error.message : 'ไม่สามารถยืนยันการชำระเงินได้', 'error')
    }
  }


  return (
    <section className="min-h-screen overflow-hidden">
      <StorefrontHeader />
      <AnnouncementBar />
      <main id="top" className="mx-auto w-full max-w-[1488px] px-6 py-8 max-md:px-3.5 max-md:py-5">
        {!isOrderConfirmed && <Link to="/" className="mb-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#76503a] px-5 text-xl font-extrabold text-white no-underline shadow-md shadow-[#76503a]/20 transition hover:bg-[#5f3d2b]">
          <ChevronLeft size={22} strokeWidth={2.75} aria-hidden="true" /> เลือกเมนูเพิ่ม
        </Link>}
        <div id="cart" className="grid grid-cols-[minmax(0,1.35fr)_minmax(320px,.95fr)] gap-6 max-lg:grid-cols-1">
          <div className="grid content-start gap-5">
            <section className="rounded-[18px] border border-[#b9cbbf] p-5 max-md:p-4" aria-labelledby="items-heading">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 id="items-heading" className="m-0 inline-flex items-center gap-2 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink"><PanelsTopLeft size={28} strokeWidth={2.5} className="text-brand" aria-hidden="true" />รายการสินค้า</h1>
                {order && <span className="inline-flex flex-wrap items-center gap-2"><strong className="font-heading text-xl text-ink">{order.orderNumber}</strong><span className={`inline-flex min-h-9 items-center rounded-full px-3 text-base font-extrabold ${orderStatusClass(order.orderStatus)}`}>{orderStatusLabel(order.orderStatus)}</span></span>}
              </div>
              <div className="mt-5 grid gap-4">
                {displayItems.length ? displayItems.map((item) => (
                  <article key={item.id} className="relative grid grid-cols-[112px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-[#bdcbbb] bg-white p-3 max-md:grid-cols-[88px_minmax(0,1fr)] max-md:gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full text-[#f97316] transition hover:bg-[#fff1e6] active:scale-95 max-md:size-7" aria-label={`ดูรายละเอียด ${item.name}`}><Info size={22} strokeWidth={2.5} /></button>
                      </DialogTrigger>
                      <DialogContent showCloseButton={false} className="max-w-md border border-[#d8dfd5] bg-white shadow-2xl">
                        <DialogClose asChild><Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1 z-10 size-8 rounded-full text-muted hover:bg-[#e1f3e5] hover:text-brand" aria-label="ปิดหน้าต่าง"><X size={18} strokeWidth={2.5} aria-hidden="true" /></Button></DialogClose>
                        <img className="mt-4 aspect-[1.4/1] w-full rounded-lg object-cover" src={item.imageUrl ?? ''} alt={item.name} />
                        <DialogHeader>
                          <DialogTitle className="font-heading text-2xl text-ink">{item.name}</DialogTitle>
                          <DialogDescription className="text-base leading-relaxed text-[#455048]">{item.description}</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-between border-t border-[#e2e8e3] pt-4">
                          <span className="text-lg font-bold text-muted">{productStockLabel(item)}</span>
                          <strong className="font-heading text-2xl text-brand">{formatPrice(item.price)}</strong>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <img className="size-[112px] rounded-lg object-cover max-md:size-[88px]" src={item.imageUrl ?? ''} alt={item.name} />
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
                    <Link to="/my-orders" className="mt-3 inline-flex min-h-11 items-center text-lg font-bold text-brand">ดูออเดอร์ของฉัน</Link>
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
                  const cutoffBadgeClass = isMorning ? 'bg-[#c8e7fb]/75 text-[#2d78b9]' : 'bg-[#ffe1b4]/75 text-[#a86117]'
                  const round = settingsQuery.data?.[value]
                  const isClosed = round ? !round.isOpen : false
                  return <button key={value} type="button" disabled={isOrderConfirmed || isClosed} aria-pressed={selected} onClick={() => setDelivery((current) => current === value ? null : value)} className={`relative grid min-h-[124px] place-items-center content-center rounded-2xl border-[1.5px] px-4 py-3 text-[#1b2b31] transition disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-none ${cardClass}`}>
                    <span className={`absolute right-3 top-3 grid size-11 place-items-center rounded-full border-2 ${accentClass} ${isMorning ? 'border-[#338ad7]' : 'border-[#c88434]'} ${selected ? 'opacity-100' : 'opacity-0'}`}><Check size={20} strokeWidth={2.5} /></span>
                    <Icon size={32} className={accentClass} aria-hidden="true" />
                    <strong className="font-heading text-[22px]">{option.label}</strong>
                    <span className="text-xl font-semibold">{round ? `จัดส่ง ${round.deliveryStart}–${round.deliveryEnd}` : 'กำลังโหลดเวลา'}</span>
                    <span className={`mt-2 rounded-full px-3 py-1 text-base font-bold ${cutoffBadgeClass}`}>{round ? (isClosed ? `ปิดรับรอบนี้แล้ว (${round.cutoff})` : `สั่งได้ถึง ${round.cutoff}`) : '—'}</span>
                  </button>
                })}
              </div>
            </section>

            <section className="rounded-[18px] border border-[#b9cbbf] bg-[#f1f8f3] p-5 max-md:p-4" aria-labelledby="recipient-heading">
              <h2 id="recipient-heading" className="m-0 inline-flex items-center gap-2 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink"><UserRound size={28} strokeWidth={2.5} className="text-brand" aria-hidden="true" />ข้อมูลผู้รับ</h2>
              <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5 text-lg max-md:grid-cols-1 max-md:gap-y-4">
                <div><dt className="text-xl font-bold text-ink">ชื่อลูกค้า</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">{user?.name ?? '—'}</dd></div>
                <div><dt className="text-xl font-bold text-ink">เบอร์โทรศัพท์</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">{user?.phone ?? '—'}</dd></div>
                <div><dt className="text-xl font-bold text-ink">สถานที่ส่งของ</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">{order?.locationName || user?.locationName || '—'}</dd></div>
                <div><dt className="text-xl font-bold text-ink">LINE ID</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">{user?.lineId || '—'}</dd></div>
              </dl>
              {!authQuery.isLoading && !user && <p className="mt-4 mb-0 text-lg font-bold text-[#c84646]">กรุณาเข้าสู่ระบบก่อนสั่งซื้อ ระบบจะใช้ชื่อและสถานที่ส่งของจากบัญชีของคุณ</p>}
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
            {!isOrderConfirmed && <button type="button" onClick={confirmOrder} disabled={!cartItems.length || createOrderMutation.isPending} aria-busy={createOrderMutation.isPending} className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#76503a] px-4 text-xl font-extrabold text-white transition hover:bg-[#5f3d2b] disabled:cursor-not-allowed disabled:opacity-50">{createOrderMutation.isPending ? 'กำลังสร้างคำสั่งซื้อ' : 'ยืนยันการเลือกสินค้า'} <Send size={20} aria-hidden="true" /></button>}

            {order && order.paymentStatus === 'pending' && <section className="rounded-[18px] border border-[#b9cbbf] bg-[#f1f8f3] p-5 max-md:p-4" aria-labelledby="payment-heading" aria-live="polite">
              <h2 id="payment-heading" className="m-0 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink">ช่องทางการชำระเงิน</h2>
              <div className="mt-5 grid place-items-center gap-4 rounded-xl border-2 border-dashed border-[#77a984] bg-white p-5 text-center">
                <div className="grid size-44 place-items-center rounded-xl border border-[#d8dfd5] bg-white p-2 shadow-inner"><QRCodeCanvas ref={qrCanvasRef} value={paymentQrValue(order.orderNumber, order.totalAmount)} size={152} bgColor="#ffffff" fgColor="#000000" level="M" marginSize={1} title={`QR Code สำหรับชำระเงินคำสั่งซื้อ ${order.orderNumber}`} /></div>
                <div>
                  <p className="m-0 text-xl font-extrabold text-ink">สแกน QR Code เพื่อชำระเงิน</p>
                  <p className="mt-1 mb-0 text-lg font-bold text-brand">ยอดชำระ {formatPrice(order.totalAmount)}</p>
                  <p className="mt-1 mb-0 text-base text-muted">ชำระเงินภายใน {settingsQuery.data?.paymentMinutes ?? 20} นาที ไม่นั้นคำสั่งซื้อจะถูกยกเลิกครับ</p>
                </div>
              </div>
              <button type="button" onClick={() => downloadPaymentQr(qrCanvasRef.current, order.orderNumber)} className="mt-4 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full border border-[#76503a] px-4 text-xl font-extrabold text-[#76503a] transition hover:bg-[#f6efe9]"><Download size={20} aria-hidden="true" />ดาวน์โหลด QR Code</button>
              <button type="button" onClick={payOrder} disabled={payOrderMutation.isPending} aria-busy={payOrderMutation.isPending} className="mt-3 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-brand px-4 text-xl font-extrabold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">{payOrderMutation.isPending ? 'กำลังยืนยัน' : 'ชำระเงินแล้ว'} <Check size={20} aria-hidden="true" /></button>
            </section>}

            {order && order.paymentStatus === 'paid' && <section className="rounded-[18px] border border-[#b9cbbf] bg-[#f1f8f3] p-5 text-center max-md:p-4" aria-live="polite">
              <p className="m-0 inline-flex items-center gap-2 font-heading text-2xl text-brand"><Check size={24} strokeWidth={3} aria-hidden="true" />ได้รับการชำระเงินแล้ว</p>
              <p className="mt-2 mb-0 text-lg font-bold text-[#455048]">คำสั่งซื้อ {order.orderNumber} อยู่ระหว่าง{orderStatusLabel(order.orderStatus)}</p>
              <p className="mt-1 mb-0 text-lg font-bold text-[#455048]">ทางร้านจะอัปเดตสถานะให้อีกครั้ง</p>
              <Link to="/my-orders" className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-[#76503a] px-6 text-lg font-extrabold text-white no-underline transition hover:bg-[#5f3d2b]">ดูออเดอร์ของฉัน</Link>
            </section>}
          </aside>
        </div>
      </main>
      <StorefrontFooter />
    </section>
  )
}
