import { CheckCircle2, Clock3, Table2 } from 'lucide-react'
import { useState } from 'react'
import { useRecentOrders } from '@/features/user/home/hooks/useRecentOrders'
import { useUserAuth } from '@/features/user/auth/hooks/useUserAuth'
import { StorefrontPagination } from '@/features/user/shared/StorefrontPagination'
import { paymentStatusLabel, thaiDateLabel } from '@/features/user/order/utils/order-labels'
import type { DeliveryPeriod } from '@/api/user/orders'

const pageSize = 10
const periodLabels: Record<DeliveryPeriod, string> = { morning: 'ช่วงเช้า', afternoon: 'ช่วงบ่าย' }

function formatOrderedAt(value: string) {
  const time = new Date(value)
  return `${thaiDateLabel(value)} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
}

export function RecentOrders() {
  const authQuery = useUserAuth()
  const ordersQuery = useRecentOrders(Boolean(authQuery.data))
  const [page, setPage] = useState(1)
  const orders = ordersQuery.data ?? []
  // ตารางนี้เป็นรายการของลูกค้าคนอื่น จึงซ่อนทั้ง section เมื่อยังไม่เข้าสู่ระบบ
  if (!authQuery.data) return null

  // กันหน้าค้างเกินจำนวนจริง เช่นรายการหมดวันแล้วเริ่มนับใหม่
  const currentPage = Math.min(page, Math.max(1, Math.ceil(orders.length / pageSize)))
  const pageOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <section id="recent-orders" className="mt-10 max-md:mt-7" aria-labelledby="recent-orders-heading">
      <div className="flex items-center gap-3 text-brand max-md:gap-2">
        <Table2 size={30} className="max-md:size-[26px]" aria-hidden="true" />
        <h2 id="recent-orders-heading" className="m-0 font-heading text-[clamp(2rem,4vw,3rem)] leading-tight tracking-[-0.035em] text-[#1d4f29]">รายการสั่งซื้อ</h2>
        {authQuery.data.locationName && <span className="text-xl font-bold text-[#2f7dcc] max-md:text-lg">({authQuery.data.locationName})</span>}
      </div>
      <div className="mt-5 overflow-x-auto rounded-[18px] border border-[#d8dfd5] bg-white max-md:mt-4" tabIndex={0} aria-label="ตารางรายการสั่งซื้อของวันนี้">
        <table className="w-max min-w-full border-collapse text-left">
          <thead className="bg-brand text-white">
            <tr>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">ชื่อลูกค้า</th>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">รายการที่สั่ง</th>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">ช่วงเวลา</th>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">สั่งเมื่อ</th>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">จำนวนเงิน</th>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">ชำระเงิน</th>
            </tr>
          </thead>
          <tbody>
            {ordersQuery.isLoading && <tr><td colSpan={6} className="px-6 py-8 text-center text-lg font-semibold text-[#455a64]">กำลังโหลดรายการสั่งซื้อ...</td></tr>}
            {ordersQuery.isError && <tr><td colSpan={6} className="px-6 py-8 text-center text-lg font-semibold text-[#c84646]">ไม่สามารถโหลดรายการสั่งซื้อได้: {ordersQuery.error.message}</td></tr>}
            {ordersQuery.isSuccess && !orders.length && <tr><td colSpan={6} className="px-6 py-8 text-center text-lg font-semibold text-[#455a64]">วันนี้ยังไม่มีรายการสั่งซื้อที่{authQuery.data.locationName || 'สถานที่ส่งของคุณ'}</td></tr>}
            {pageOrders.map((order) => (
              <tr key={order.id} className="border-t border-[#e5eae2] text-[#26352d]">
                <td className="whitespace-nowrap px-6 py-5 text-xl font-bold">{order.userName}</td>
                <td className="px-6 py-5"><ul className="m-0 grid list-none gap-1 p-0 text-lg leading-snug">{order.items.map((item) => <li key={item}>{item}</li>)}</ul></td>
                <td className={`whitespace-nowrap px-6 py-5 text-lg font-extrabold ${order.deliveryPeriod === 'morning' ? 'text-[#338ad7]' : 'text-[#c88434]'}`}>{periodLabels[order.deliveryPeriod]}</td>
                <td className="whitespace-nowrap px-6 py-5 text-lg font-semibold text-[#455a64]">{formatOrderedAt(order.orderedAt)}</td>
                <td className="whitespace-nowrap px-6 py-5 text-lg font-extrabold text-[#76503a]">{order.totalAmount.toLocaleString('th-TH')} บาท</td>
                <td className="whitespace-nowrap px-6 py-5"><span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-lg font-extrabold ${order.paymentStatus === 'paid' ? 'bg-[#def2e1] text-[#287b3b]' : 'bg-[#ffe6e3] text-[#bd3b35]'}`}>{order.paymentStatus === 'paid' ? <CheckCircle2 size={18} aria-hidden="true" /> : <Clock3 size={18} aria-hidden="true" />}{paymentStatusLabel(order.paymentStatus)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <StorefrontPagination currentPage={currentPage} totalItems={orders.length} pageSize={pageSize} onPageChange={setPage} label="รายการสั่งซื้อ" />
    </section>
  )
}
