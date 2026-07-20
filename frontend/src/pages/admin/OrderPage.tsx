import { Filter, Search, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { deliveryPeriods, formatPrice, getOrderTotal, mockOrders, statusClass, type DeliveryPeriod, type OrderStatus } from '@/features/admin/orders/order-data'

export function OrderPage() {
  const [date, setDate] = useState('2026-07-20')
  const [period, setPeriod] = useState<'all' | DeliveryPeriod>('all')
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const [query, setQuery] = useState('')
  const orders = useMemo(() => mockOrders.filter((order) => (
    order.deliveryDate === date
    && (period === 'all' || order.period === period)
    && (status === 'all' || order.status === status)
    && `${order.id} ${order.customerName} ${order.location}`.toLowerCase().includes(query.toLowerCase())
  )), [date, period, query, status])

  return <section className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">จัดการคำสั่งซื้อรายรายการ</p><h1 className="admin-title">ออเดอร์</h1></div><Link to="/admin/dispatches/today" className="admin-secondary-button">ดูสรุปรอบส่งวันนี้</Link></div>
    <section className="admin-filter-card" aria-label="ตัวกรองออเดอร์">
      <div className="admin-filter-title"><Filter size={19} aria-hidden="true" /><strong>ตัวกรอง</strong></div>
      <label>วันจัดส่ง<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label>รอบส่ง<select value={period} onChange={(event) => setPeriod(event.target.value as 'all' | DeliveryPeriod)}><option value="all">ทุกรอบ</option><option value="morning">รอบเช้า</option><option value="afternoon">รอบบ่าย</option></select></label>
      <label>สถานะ<select value={status} onChange={(event) => setStatus(event.target.value as 'all' | OrderStatus)}><option value="all">ทุกสถานะ</option>{['รอชำระเงิน', 'จ่ายแล้ว', 'เตรียมของ', 'ออกส่งแล้ว', 'ส่งแล้ว', 'ยกเลิก'].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="admin-search"><Search size={18} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อลูกค้า จุดรับ หรือเลขออเดอร์" /></label>
    </section>
    <div className="admin-table-meta"><span>พบ {orders.length} ออเดอร์</span><span><SlidersHorizontal size={16} aria-hidden="true" /> ข้อมูลตามวันที่เลือก</span></div>
    <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th>เลขออเดอร์</th><th>ลูกค้า / จุดรับ</th><th>รอบส่ง</th><th>รายการ</th><th>ยอดรวม</th><th>ชำระเงิน</th><th>สถานะ</th><th><span className="sr-only">ดูรายละเอียด</span></th></tr></thead><tbody>{orders.length ? orders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong><small>{order.orderedAt}</small></td><td><strong>{order.customerName}</strong><small>{order.location}</small></td><td><strong>{deliveryPeriods[order.period].label}</strong><small>{deliveryPeriods[order.period].deliveryTime}</small></td><td>{order.items.map((item) => <small key={item.name}>{item.name} {item.quantity} {item.unit}</small>)}</td><td className="numeric"><strong>{formatPrice(getOrderTotal(order))}</strong></td><td><span className={`admin-status ${statusClass(order.paymentStatus)}`}>{order.paymentStatus}</span></td><td><span className={`admin-status ${statusClass(order.status)}`}>{order.status}</span></td><td><Link className="admin-table-link" to={`/admin/orders/${order.id}`}>ดู</Link></td></tr>) : <tr><td className="admin-empty-cell" colSpan={8}>ไม่พบออเดอร์ที่ตรงกับตัวกรอง</td></tr>}</tbody></table></div></div>
  </section>
}
