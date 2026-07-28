import { CheckCircle2, ChevronLeft, Clock3, MapPin, PackageCheck, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StorefrontHeader } from '@/features/user/shared/StorefrontHeader'
import { StorefrontFooter } from '@/features/user/shared/StorefrontFooter'
import { useCustomerAuth } from '@/features/user/auth/hooks/useCustomerAuth'
import { useCustomerOrders } from '@/features/user/order/hooks/useCustomerOrders'
import { deliveryPeriodLabel, orderStatusClass, orderStatusLabel, paymentStatusLabel, thaiDateLabel } from '@/features/user/order/utils/order-labels'

export function MyOrdersPage() {
  const authQuery = useCustomerAuth()
  const ordersQuery = useCustomerOrders(Boolean(authQuery.data))
  const orders = ordersQuery.data ?? []

  return <section className="min-h-screen overflow-hidden">
    <StorefrontHeader />
    <main className="mx-auto w-full max-w-[960px] px-6 py-8 max-md:px-3.5 max-md:py-5">
      <Link to="/" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#76503a] px-5 text-xl font-extrabold text-white no-underline shadow-md shadow-[#76503a]/20 transition hover:bg-[#5f3d2b]"><ChevronLeft size={22} strokeWidth={2.75} aria-hidden="true" /> เลือกเมนูเพิ่ม</Link>
      <div className="mt-5"><h1 className="m-0 font-heading text-[clamp(2rem,5vw,3rem)] text-ink">ออเดอร์ของฉัน</h1></div>
      {!authQuery.isLoading && !authQuery.data && <p className="mt-4 mb-0 text-lg font-bold text-muted">กรุณาเข้าสู่ระบบเพื่อดูออเดอร์ของคุณ</p>}
      {ordersQuery.isLoading && <p className="mt-4 mb-0 text-lg font-bold text-muted">กำลังโหลดออเดอร์...</p>}
      {ordersQuery.isError && <p className="mt-4 mb-0 text-lg font-bold text-[#c84646]" role="alert">{ordersQuery.error.message}</p>}
      {ordersQuery.isSuccess && !orders.length && <p className="mt-4 mb-0 text-lg font-bold text-muted">ยังไม่มีออเดอร์ เลือกเมนูที่ชอบแล้วสั่งซื้อได้เลย</p>}
      <div className="mt-3 grid gap-4">
        {orders.map((order) => <article key={order.id} className="rounded-2xl border border-[#b9cbbf] bg-white p-5 shadow-sm max-md:p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="m-0 text-base font-bold text-muted">{order.orderNumber} · {thaiDateLabel(order.orderedAt)}</p>
              <h2 className="mt-1 mb-0 font-heading text-2xl text-ink">{orderStatusLabel(order.orderStatus)}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex min-h-9 items-center rounded-full px-3 text-base font-extrabold ${order.paymentStatus === 'paid' ? 'bg-[#def2e1] text-[#287b3b]' : 'bg-[#fbe3e3] text-[#c0453f]'}`}>{paymentStatusLabel(order.paymentStatus)}</span>
              <span className={`inline-flex min-h-9 items-center rounded-full px-3 text-base font-extrabold ${orderStatusClass(order.orderStatus)}`}>
                {order.orderStatus === 'delivered' ? <CheckCircle2 className="mr-1.5" size={18} aria-hidden="true" /> : <Clock3 className="mr-1.5" size={18} aria-hidden="true" />}{orderStatusLabel(order.orderStatus)}
              </span>
            </div>
          </div>
          <div className="mt-5 grid gap-3 border-t border-[#e2e8e3] pt-4 text-lg text-[#455048]">
            <p className="m-0 flex items-start gap-2">
              <PackageCheck className="mt-0.5 shrink-0 text-brand" size={20} aria-hidden="true" />
              <span>{order.items.map((item) => `${item.name} ${item.quantity} ${item.unitName}`).join(', ')}</span>
            </p>
            <p className="m-0 flex items-center gap-2"><MapPin className="shrink-0 text-brand" size={20} aria-hidden="true" />{order.locationName} · {deliveryPeriodLabel(order.deliveryPeriod)} {thaiDateLabel(order.deliveryDate)}</p>
            <p className="m-0 flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2"><ReceiptText className="text-brand" size={20} aria-hidden="true" />ยอดชำระ</span>
              <strong className="font-heading text-xl text-brand">{order.totalAmount.toLocaleString('th-TH')} บาท</strong>
            </p>
          </div>
        </article>)}
      </div>
    </main>
    <StorefrontFooter />
  </section>
}
