import { ArrowLeft, CheckCircle2, Clock3, MapPin, PackageCheck, Phone, ReceiptText, Save, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { deliveryPeriods, formatPrice, getOrderTotal, mockOrders, orderListStatuses, statusClass, type OrderStatus } from '@/features/admin/orders/order-data'

const statusOptions: OrderStatus[] = [...orderListStatuses]

export function OrderDetailPage() {
  const { orderId } = useParams()
  const order = mockOrders.find((item) => item.id === orderId)
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? 'รอชำระเงิน')
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus ?? 'รอชำระเงิน')
  if (!order) return <section className="admin-page"><div className="admin-page-heading"><div><h1 className="admin-title">ไม่พบออเดอร์</h1></div></div><Link className="admin-primary-button" to="/admin/orders">กลับไปหน้าออเดอร์</Link></section>

  return <section className="admin-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/orders"><ArrowLeft size={18} />กลับไปหน้าออเดอร์</Link><h1 className="admin-title">{order.id}</h1></div><span className={`admin-status admin-order-status ${statusClass(status)}`}>{status}</span></div>
    <div className="order-detail-grid">
      <section className="admin-detail-card"><h2><ReceiptText size={21} aria-hidden="true" />รายการสินค้า</h2><div className="order-item-list">{order.items.map((item) => <div key={item.name}><span><strong>{item.name}</strong><small>{formatPrice(item.unitPrice)} ต่อ {item.unit}</small></span><strong>{item.quantity} {item.unit}</strong><strong>{formatPrice(item.quantity * item.unitPrice)}</strong></div>)}</div><div className="order-total"><span>ยอดชำระสุทธิ</span><strong>{formatPrice(getOrderTotal(order))}</strong></div></section>
      <div className="grid gap-4"><section className="admin-detail-card"><h2><UserRound size={21} aria-hidden="true" />ข้อมูลผู้รับ</h2><dl className="admin-detail-list"><div><dt>ชื่อลูกค้า</dt><dd>{order.customerName}</dd></div><div><dt><Phone size={15} aria-hidden="true" /> เบอร์โทรศัพท์</dt><dd>{order.phone}</dd></div><div><dt>LINE ID</dt><dd>{order.lineId}</dd></div><div><dt><MapPin size={15} aria-hidden="true" /> จุดรับสินค้า</dt><dd>{order.location}</dd></div><div><dt><Clock3 size={15} aria-hidden="true" /> เวลาสั่ง</dt><dd>{order.orderedAt}</dd></div></dl></section><section className="admin-detail-card"><h2><PackageCheck size={21} aria-hidden="true" />รอบจัดส่ง</h2><p className="delivery-summary"><strong>{deliveryPeriods[order.period].label}</strong><span>{deliveryPeriods[order.period].cutoff}</span><span>{deliveryPeriods[order.period].deliveryTime}</span></p></section></div>
    </div>
    <section className="admin-detail-card admin-status-editor"><h2><CheckCircle2 size={21} aria-hidden="true" />อัปเดตสถานะ</h2><div><label>การชำระเงิน<Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as typeof paymentStatus)}><SelectTrigger aria-label="การชำระเงิน"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="รอชำระเงิน">รอชำระเงิน</SelectItem><SelectItem value="จ่ายแล้ว">จ่ายแล้ว</SelectItem></SelectContent></Select></label><label>สถานะออเดอร์<Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}><SelectTrigger aria-label="สถานะออเดอร์"><SelectValue /></SelectTrigger><SelectContent>{statusOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label><button className="admin-primary-button" type="button"><Save size={20} aria-hidden="true" />บันทึก</button></div></section>
  </section>
}
