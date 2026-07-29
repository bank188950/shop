import { Eye, Repeat2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThaiDatePicker } from '@/components/ui/thai-date-picker'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'
import { adminOrderStatuses, deliveryPeriods, formatPrice, orderStatusClass, orderStatusLabel, orderedAtLabel, paymentStatusClass, paymentStatusLabel, todayIsoDate } from '@/features/admin/orders/utils/order-labels'
import { useAdminOrders } from '@/features/admin/orders/hooks/useAdminOrders'
import type { AdminDeliveryPeriod, AdminOrderStatus } from '@/api/admin/orders'

export function OrderPage() {
  const [date, setDate] = useState(todayIsoDate)
  const [period, setPeriod] = useState<'all' | AdminDeliveryPeriod>('all')
  const [locationId, setLocationId] = useState<'all' | number>('all')
  const [status, setStatus] = useState<'all' | AdminOrderStatus>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const filters = useMemo(() => ({ deliveryDate: date, deliveryPeriod: period, locationId, orderStatus: status, query }), [date, locationId, period, query, status])
  const ordersQuery = useAdminOrders(filters)
  const orders = ordersQuery.data?.orders ?? []
  const locations = ordersQuery.data?.locations ?? []
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize))
  const visibleOrders = orders.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount))
  }, [pageCount])

  // จุดรับสินค้าที่เลือกไว้อาจไม่มีรายการสั่งซื้อในวันที่เพิ่งเลือก จึงต้องคืนค่าเป็นทั้งหมดเพื่อไม่ให้ตัวกรองค้างที่ค่าที่เลือกไม่ได้แล้ว
  useEffect(() => {
    if (!ordersQuery.data || ordersQuery.isPlaceholderData || locationId === 'all') return
    if (!locations.some((location) => location.id === locationId)) setLocationId('all')
  }, [locationId, locations, ordersQuery.data, ordersQuery.isPlaceholderData])

  return <section className="admin-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">รายการสั่งซื้อ</h1></div><Link to="/admin/dispatches-today" className="admin-secondary-button"><Repeat2 size={18} aria-hidden="true" />ดูสรุปรอบส่งวันนี้</Link></div>
    <section className="admin-filter-card" aria-label="ตัวกรองรายการสั่งซื้อ">
      <label className="admin-filter-date">วันจัดส่ง<ThaiDatePicker value={date} onValueChange={setDate} ariaLabel="เลือกวันจัดส่ง" /></label>
      <label className="admin-search"><Search size={18} aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อลูกค้า หรือเลขที่รายการสั่งซื้อ" /></label>
      <label className="admin-filter-select">รอบส่ง<Select value={period} onValueChange={(value) => setPeriod(value as 'all' | AdminDeliveryPeriod)}><SelectTrigger aria-label="รอบส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem><SelectItem value="morning">รอบเช้า</SelectItem><SelectItem value="afternoon">รอบบ่าย</SelectItem></SelectContent></Select></label>
      <label className="admin-filter-select">จุดนัด<Select value={String(locationId)} onValueChange={(value) => setLocationId(value === 'all' ? 'all' : Number(value))}><SelectTrigger aria-label="จุดนัด"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem>{locations.map((location) => <SelectItem key={location.id} value={String(location.id)}>{location.name}</SelectItem>)}</SelectContent></Select></label>
      <label className="admin-filter-select">สถานะ<Select value={status} onValueChange={(value) => setStatus(value as 'all' | AdminOrderStatus)}><SelectTrigger aria-label="สถานะ"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem>{adminOrderStatuses.map((item) => <SelectItem key={item} value={item}>{orderStatusLabel(item)}</SelectItem>)}</SelectContent></Select></label>
    </section>
    <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th>เลขที่รายการสั่งซื้อ</th><th>ลูกค้า / จุดรับ</th><th>รอบส่ง</th><th>รายการ</th><th>ยอดรวม</th><th>ชำระเงิน</th><th>สถานะ</th><th><span className="sr-only">ดูรายละเอียด</span></th></tr></thead><tbody>{ordersQuery.isLoading ? <tr><td className="admin-empty-cell" colSpan={8}>กำลังโหลดรายการสั่งซื้อ...</td></tr> : ordersQuery.isError ? <tr><td className="admin-empty-cell" colSpan={8}>ไม่สามารถโหลดรายการสั่งซื้อได้: {ordersQuery.error.message}</td></tr> : orders.length ? visibleOrders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong><small>{orderedAtLabel(order.orderedAt)}</small></td><td><strong>{order.userName}</strong><small>{order.locationName}</small></td><td><strong>{deliveryPeriods[order.deliveryPeriod].label}</strong><small>{deliveryPeriods[order.deliveryPeriod].deliveryTime}</small></td><td>{order.items.map((item) => <small key={item.name}>{item.name} {item.quantity} {item.unitName}</small>)}</td><td className="numeric"><strong>{formatPrice(order.totalAmount)}</strong></td><td><span className={`admin-status ${paymentStatusClass(order.paymentStatus)}`}>{paymentStatusLabel(order.paymentStatus)}</span></td><td><span className={`admin-status ${orderStatusClass(order.orderStatus)}`}>{orderStatusLabel(order.orderStatus)}</span></td><td><Link className="admin-table-link" to={`/admin/orders/${order.id}`} aria-label={`ดูรายละเอียดรายการสั่งซื้อ ${order.orderNumber}`}><Eye size={19} aria-hidden="true" /></Link></td></tr>) : <tr><td className="admin-empty-cell" colSpan={8}>ไม่พบรายการสั่งซื้อที่ตรงกับตัวกรอง</td></tr>}</tbody></table></div><AdminTablePagination currentPage={page} totalItems={orders.length} pageSize={pageSize} onPageChange={setPage} label="รายการสั่งซื้อ" /></div>
  </section>
}
