import { ArrowLeft, CheckCircle2, MapPin, PackageCheck, Phone, ReceiptText, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { deliveryPeriods, formatPrice, getOrderTotal, mockOrders, statusClass, type OrderStatus } from '@/features/admin/orders/order-data'

const statusOptions: OrderStatus[] = ['รอชำระเงิน', 'จ่ายแล้ว', 'เตรียมของ', 'ออกส่งแล้ว', 'ส่งแล้ว', 'ยกเลิก']

export function OrderDetailPage() {
  const { orderId } = useParams()
  const order = mockOrders.find((item) => item.id === orderId)
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? 'รอชำระเงิน')
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus ?? 'รอชำระเงิน')
  if (!order) return <section className="admin-page"><div className="admin-page-heading"><div><h1 className="admin-title">ไม่พบออเดอร์</h1></div></div><Link className="admin-primary-button" to="/admin/orders">กลับไปหน้าออเดอร์</Link></section>

  return <section className="admin-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/orders"><ArrowLeft size={18} />กลับไปหน้าออเดอร์</Link><p className="admin-kicker">{order.orderedAt}</p><h1 className="admin-title">{order.id}</h1></div><span className={`admin-status ${statusClass(status)}`}>{status}</span></div>
    <div className="order-detail-grid">
      <section className="admin-detail-card"><h2><ReceiptText size={21} aria-hidden="true" />รายการสินค้า</h2><div className="order-item-list">{order.items.map((item) => <div key={item.name}><span><strong>{item.name}</strong><small>{formatPrice(item.unitPrice)} ต่อ {item.unit}</small></span><strong>{item.quantity} {item.unit}</strong><strong>{formatPrice(item.quantity * item.unitPrice)}</strong></div>)}</div><div className="order-total"><span>ยอดชำระสุทธิ</span><strong>{formatPrice(getOrderTotal(order))}</strong></div></section>
      <div className="grid gap-4"><section className="admin-detail-card"><h2><UserRound size={21} aria-hidden="true" />ข้อมูลผู้รับ</h2><dl className="admin-detail-list"><div><dt>ชื่อลูกค้า</dt><dd>{order.customerName}</dd></div><div><dt><Phone size={15} aria-hidden="true" /> เบอร์โทรศัพท์</dt><dd>{order.phone}</dd></div><div><dt>LINE ID</dt><dd>{order.lineId}</dd></div><div><dt><MapPin size={15} aria-hidden="true" /> จุดรับสินค้า</dt><dd>{order.location}</dd></div></dl></section><section className="admin-detail-card"><h2><PackageCheck size={21} aria-hidden="true" />รอบจัดส่ง</h2><p className="delivery-summary"><strong>{deliveryPeriods[order.period].label}</strong><span>{deliveryPeriods[order.period].cutoff}</span><span>{deliveryPeriods[order.period].deliveryTime}</span></p></section></div>
    </div>
    <section className="admin-detail-card admin-status-editor"><h2><CheckCircle2 size={21} aria-hidden="true" />อัปเดตสถานะ</h2><div><label>การชำระเงิน<select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as typeof paymentStatus)}><option>รอชำระเงิน</option><option>จ่ายแล้ว</option></select></label><label>สถานะออเดอร์<select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select></label><button className="admin-primary-button" type="button">บันทึกสถานะ</button></div><p>การเปลี่ยนแปลงในหน้านี้เป็นข้อมูลม็อกอัปสำหรับการออกแบบ</p></section>
  </section>
}
