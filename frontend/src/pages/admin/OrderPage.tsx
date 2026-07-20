import { Eye, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { deliveryPeriods, formatPrice, getOrderListStatus, getOrderTotal, mockOrders, orderListStatuses, statusClass, type DeliveryPeriod, type OrderListStatus } from '@/features/admin/orders/order-data'

export function OrderPage() {
  const [date, setDate] = useState('2026-07-20')
  const [period, setPeriod] = useState<'all' | DeliveryPeriod>('all')
  const [location, setLocation] = useState('all')
  const [status, setStatus] = useState<'all' | OrderListStatus>('all')
  const [query, setQuery] = useState('')
  const locations = [...new Set(mockOrders.map((order) => order.location))]
  const orders = useMemo(() => mockOrders.filter((order) => (
    order.deliveryDate === date
    && (period === 'all' || order.period === period)
    && (location === 'all' || order.location === location)
    && (status === 'all' || getOrderListStatus(order) === status)
    && `${order.id} ${order.customerName}`.toLowerCase().includes(query.toLowerCase())
  )), [date, location, period, query, status])

  return <section className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">จัดการคำสั่งซื้อรายรายการ</p><h1 className="admin-title">ออเดอร์</h1></div><Link to="/admin/dispatches/today" className="admin-secondary-button">ดูสรุปรอบส่งวันนี้</Link></div>
    <section className="admin-filter-card" aria-label="ตัวกรองออเดอร์">
      <label className="admin-filter-date">วันจัดส่ง<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label className="admin-search"><Search size={18} aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อลูกค้า หรือเลขออเดอร์" /></label>
      <label className="admin-filter-select">รอบส่ง<Select value={period} onValueChange={(value) => setPeriod(value as 'all' | DeliveryPeriod)}><SelectTrigger aria-label="รอบส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem><SelectItem value="morning">รอบเช้า</SelectItem><SelectItem value="afternoon">รอบบ่าย</SelectItem></SelectContent></Select></label>
      <label className="admin-filter-select">จุดนัด<Select value={location} onValueChange={setLocation}><SelectTrigger aria-label="จุดนัด"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem>{locations.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
      <label className="admin-filter-select">สถานะ<Select value={status} onValueChange={(value) => setStatus(value as 'all' | OrderListStatus)}><SelectTrigger aria-label="สถานะ"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem>{orderListStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
    </section>
    <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th>เลขออเดอร์</th><th>ลูกค้า / จุดรับ</th><th>รอบส่ง</th><th>รายการ</th><th>ยอดรวม</th><th>ชำระเงิน</th><th>สถานะ</th><th><span className="sr-only">ดูรายละเอียด</span></th></tr></thead><tbody>{orders.length ? orders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong><small>{order.orderedAt}</small></td><td><strong>{order.customerName}</strong><small>{order.location}</small></td><td><strong>{deliveryPeriods[order.period].label}</strong><small>{deliveryPeriods[order.period].deliveryTime}</small></td><td>{order.items.map((item) => <small key={item.name}>{item.name} {item.quantity} {item.unit}</small>)}</td><td className="numeric"><strong>{formatPrice(getOrderTotal(order))}</strong></td><td><span className={`admin-status ${statusClass(order.paymentStatus)}`}>{order.paymentStatus}</span></td><td><span className={`admin-status ${statusClass(getOrderListStatus(order))}`}>{getOrderListStatus(order)}</span></td><td><Link className="admin-table-link" to={`/admin/orders/${order.id}`} aria-label={`ดูรายละเอียดออเดอร์ ${order.id}`}><Eye size={19} aria-hidden="true" /></Link></td></tr>) : <tr><td className="admin-empty-cell" colSpan={8}>ไม่พบออเดอร์ที่ตรงกับตัวกรอง</td></tr>}</tbody></table></div></div>
  </section>
}
