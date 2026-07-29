import { ArrowLeft, CheckCircle2, Clock3, MapPin, PackageCheck, Phone, ReceiptText, Save, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { deliveryPeriods, formatPrice, orderStatusClass, orderStatusLabel, orderedAtLabel } from '@/features/admin/orders/utils/order-labels'
import { useAdminOrder, useUpdateAdminOrderStatus } from '@/features/admin/orders/hooks/useAdminOrders'
import type { AdminOrderStatus } from '@/api/admin/orders'

const unpaidStatusOptions: AdminOrderStatus[] = ['pending_payment', 'cancelled']
/** ฝั่งจ่ายแล้วเลือกได้เฉพาะ `รอตรวจสอบ` เพราะขั้นถัดไปต้องเดินผ่านหน้าเตรียมสินค้าและรอบส่งวันนี้เท่านั้น */
const paidStatusOptions: AdminOrderStatus[] = ['pending_review']
const paidFlowStatuses: AdminOrderStatus[] = ['pending_review', 'preparing', 'ready_for_delivery', 'delivered']

/** คงสถานะที่บันทึกไว้เป็นตัวเลือกด้วย ไม่งั้นรายการที่เดินหน้าไปแล้วจะแสดงค่าว่างและถูกดึงกลับเมื่อกดบันทึก */
function paidStatusOptionsFor(savedStatus: AdminOrderStatus) {
  return paidFlowStatuses.includes(savedStatus) && !paidStatusOptions.includes(savedStatus) ? [...paidStatusOptions, savedStatus] : paidStatusOptions
}

export function OrderDetailPage() {
  const { orderId } = useParams()
  const orderQuery = useAdminOrder(Number(orderId) || undefined)
  const updateMutation = useUpdateAdminOrderStatus()
  const order = orderQuery.data
  const [status, setStatus] = useState<AdminOrderStatus>('pending_payment')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending')

  useEffect(() => {
    if (!order) return
    setPaymentStatus(order.paymentStatus === 'paid' ? 'paid' : 'pending')
    setStatus(order.orderStatus)
  }, [order])

  if (orderQuery.isLoading) return <section className="admin-page"><div className="admin-page-heading"><div><h1 className="admin-title">กำลังโหลดรายการสั่งซื้อ...</h1></div></div></section>
  if (!order) return <section className="admin-page"><div className="admin-page-heading"><div><h1 className="admin-title">ไม่พบรายการสั่งซื้อ</h1></div></div><Link className="admin-primary-button" to="/admin/orders">กลับไปหน้ารายการสั่งซื้อ</Link></section>
  const savedStatus = order.orderStatus
  const statusOptions = paymentStatus === 'pending' ? unpaidStatusOptions : paidStatusOptionsFor(savedStatus)

  function changePaymentStatus(value: 'pending' | 'paid') {
    setPaymentStatus(value)
    setStatus((currentStatus) => {
      const allowedStatuses = value === 'pending' ? unpaidStatusOptions : paidStatusOptionsFor(savedStatus)
      return allowedStatuses.includes(currentStatus) ? currentStatus : allowedStatuses[0]
    })
  }

  async function saveStatus() {
    if (!order) return
    try {
      await updateMutation.mutateAsync({ orderId: order.id, input: { orderStatus: status, paymentStatus } })
      Swal.fire({ icon: 'success', title: 'บันทึกสถานะแล้ว', confirmButtonText: 'ตกลง', confirmButtonColor: '#176344' })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'บันทึกสถานะไม่สำเร็จ', text: error instanceof Error ? error.message : 'ไม่สามารถบันทึกสถานะรายการสั่งซื้อได้', confirmButtonText: 'ตกลง', confirmButtonColor: '#7b393e' })
    }
  }

  return <section className="admin-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/orders"><ArrowLeft size={18} />กลับไปหน้ารายการสั่งซื้อ</Link><h1 className="admin-title admin-order-detail-id">{order.orderNumber}</h1></div><span className={`admin-status admin-order-status ${orderStatusClass(status)}`}>{orderStatusLabel(status)}</span></div>
    <div className="order-detail-grid">
      <section className="admin-detail-card"><h2><ReceiptText size={21} aria-hidden="true" />รายการสินค้า</h2><div className="order-item-list">{order.items.map((item) => <div key={item.name}><span><strong>{item.name}</strong><small>{formatPrice(item.unitPrice)} ต่อ {item.unitName}</small></span><strong>{item.quantity} {item.unitName}</strong><strong>{formatPrice(item.lineTotal)}</strong></div>)}</div><div className="order-total"><span>ยอดชำระสุทธิ</span><strong>{formatPrice(order.totalAmount)}</strong></div></section>
      <div className="grid gap-4"><section className="admin-detail-card"><h2><UserRound size={21} aria-hidden="true" />ข้อมูลผู้รับ</h2><dl className="admin-detail-list"><div><dt>ชื่อลูกค้า</dt><dd>{order.userName}</dd></div><div><dt><Phone size={15} aria-hidden="true" /> เบอร์โทรศัพท์</dt><dd>{order.phone || '-'}</dd></div><div><dt>LINE ID</dt><dd>{order.lineId || '-'}</dd></div><div><dt><MapPin size={15} aria-hidden="true" /> จุดรับสินค้า</dt><dd>{order.locationName}</dd></div><div><dt><Clock3 size={15} aria-hidden="true" /> เวลาสั่ง</dt><dd>{orderedAtLabel(order.orderedAt)}</dd></div></dl></section><section className="admin-detail-card"><h2><PackageCheck size={21} aria-hidden="true" />รอบจัดส่ง</h2><p className="delivery-summary"><strong>{deliveryPeriods[order.deliveryPeriod].label}</strong><span>{deliveryPeriods[order.deliveryPeriod].cutoff}</span><span>{deliveryPeriods[order.deliveryPeriod].deliveryTime}</span></p></section></div>
    </div>
    <section className="admin-detail-card admin-status-editor"><h2><CheckCircle2 size={21} aria-hidden="true" />อัปเดตสถานะ</h2><div><label>การชำระเงิน<Select value={paymentStatus} onValueChange={(value) => changePaymentStatus(value as 'pending' | 'paid')}><SelectTrigger aria-label="การชำระเงิน"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">รอชำระเงิน</SelectItem><SelectItem value="paid">จ่ายแล้ว</SelectItem></SelectContent></Select></label><label>สถานะรายการสั่งซื้อ<Select value={status} onValueChange={(value) => setStatus(value as AdminOrderStatus)}><SelectTrigger aria-label="สถานะรายการสั่งซื้อ"><SelectValue /></SelectTrigger><SelectContent>{statusOptions.map((item) => <SelectItem key={item} value={item}>{orderStatusLabel(item)}</SelectItem>)}</SelectContent></Select></label><button className="admin-primary-button" type="button" onClick={saveStatus} disabled={updateMutation.isPending}><Save size={20} aria-hidden="true" />บันทึก</button></div></section>
  </section>
}
