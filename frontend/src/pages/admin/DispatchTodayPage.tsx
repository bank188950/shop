import { Banknote, CalendarDays, Check, ChevronRight, MapPin, PackageOpen, Repeat2, Sun, Sunset, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { ThaiDatePicker } from '@/components/ui/thai-date-picker'
import { deliveryDateLabel, deliveryPeriods, formatPrice, orderStatusClass, orderStatusLabel, todayIsoDate } from '@/features/admin/orders/utils/order-labels'
import { useAdminOrders, useUpdateAdminOrdersStatus } from '@/features/admin/orders/hooks/useAdminOrders'
import type { AdminDeliveryPeriod, AdminOrder } from '@/api/admin/orders'

/** รวมสินค้าของหลายรายการสั่งซื้อเป็นยอดเดียวตามหน่วยที่สั่งจริง */
function getSummaryItems(orders: AdminOrder[]) {
  const items = new Map<string, { name: string, unitName: string, quantity: number }>()
  orders.forEach((order) => order.items.forEach((item) => {
    const current = items.get(item.name) ?? { name: item.name, unitName: item.unitName, quantity: 0 }
    items.set(item.name, { ...current, quantity: current.quantity + item.quantity })
  }))
  return Array.from(items.values())
}

function itemToneClass(name: string) {
  return name.includes('น้ำ') ? 'drink' : name.includes('ไส้กรอก') ? 'sausage' : name.includes('เนื้อ') ? 'beef' : 'pork'
}

export function DispatchTodayPage() {
  const [period, setPeriod] = useState<AdminDeliveryPeriod>('morning')
  // เปิดหน้ามาที่รอบส่งของวันนี้ก่อน แล้วให้ผู้ดูแลเลือกวันจัดส่งอื่นได้จากตัวกรอง
  const [date, setDate] = useState(todayIsoDate)
  const filters = useMemo(() => ({ deliveryDate: date, deliveryPeriod: period, locationId: 'all' as const, orderStatus: 'all' as const, query: '' }), [date, period])
  const ordersQuery = useAdminOrders(filters)
  const updateStatusMutation = useUpdateAdminOrdersStatus()
  // ใบส่งของนับเฉพาะรายการที่ชำระเงินแล้วและยังไม่ถูกยกเลิก
  const orders = useMemo(() => (ordersQuery.data?.orders ?? []).filter((order) => order.paymentStatus === 'paid' && order.orderStatus !== 'cancelled'), [ordersQuery.data])
  const locations = useMemo(() => {
    const groups = new Map<number, AdminOrder[]>()
    orders.forEach((order) => groups.set(order.locationId, [...(groups.get(order.locationId) ?? []), order]))
    return Array.from(groups, ([locationId, locationOrders]) => ({
      locationId,
      locationName: locationOrders[0].locationName,
      orders: locationOrders,
      total: locationOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      items: getSummaryItems(locationOrders),
    }))
  }, [orders])
  const total = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalItems = useMemo(() => getSummaryItems(orders), [orders])
  const emptyMessage = ordersQuery.isLoading ? 'กำลังโหลดรอบส่งวันนี้...'
    : ordersQuery.isError ? `ไม่สามารถโหลดรอบส่งวันนี้ได้: ${ordersQuery.error.message}`
      : `ไม่มีรายการสั่งซื้อที่ชำระเงินแล้วใน${deliveryPeriods[period].label}ของวันที่ ${deliveryDateLabel(date)}`

  async function updateLocationStatuses(locationName: string, locationOrders: AdminOrder[]) {
    const readyOrders = locationOrders.filter((order) => order.orderStatus === 'ready_for_delivery')

    if (!readyOrders.length) {
      await Swal.fire({
        title: 'ยังไม่พร้อมเปลี่ยนสถานะ',
        html: 'ไม่สามารถเปลี่ยนสถานะเป็นส่งแล้วได้<span class="dispatch-warning-message-line">เนื่องจากยังไม่มีรายการที่พร้อมส่ง</span>',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#607168',
        customClass: { icon: 'dispatch-warning-alert-icon' },
      })
      return
    }

    const result = await Swal.fire({
      title: 'ยืนยันการส่งสินค้า',
      text: `ต้องการเปลี่ยนพร้อมส่ง ${readyOrders.length} รายการ ของ${locationName} เป็นส่งแล้ว`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#347657',
      cancelButtonColor: '#607168',
      reverseButtons: true,
      focusCancel: true,
      customClass: { icon: 'dispatch-confirm-alert-icon' },
    })
    if (!result.isConfirmed) return

    try {
      await updateStatusMutation.mutateAsync({ orderIds: readyOrders.map((order) => order.id), orderStatus: 'delivered' })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'เปลี่ยนสถานะไม่สำเร็จ', text: error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนสถานะรายการสั่งซื้อได้', confirmButtonText: 'ตกลง', confirmButtonColor: '#7b393e' })
    }
  }

  return <section className="admin-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">รอบส่งวันนี้</h1></div><Link className="admin-secondary-button" to="/admin/orders"><Repeat2 size={18} aria-hidden="true" />ดูรายการสั่งซื้อ</Link></div>
    <section className="dispatch-filter" aria-label="ตัวกรองวันจัดส่ง"><label>วันจัดส่ง<ThaiDatePicker value={date} onValueChange={setDate} ariaLabel="เลือกวันจัดส่ง" /></label></section>
    <section className="dispatch-period-picker" aria-label="เลือกรอบจัดส่ง">{(Object.keys(deliveryPeriods) as AdminDeliveryPeriod[]).map((value) => { const Icon = value === 'morning' ? Sun : Sunset; const isSelected = period === value; return <button type="button" key={value} className={`${value} ${isSelected ? 'active' : ''}`} aria-pressed={isSelected} onClick={() => setPeriod(value)}>{isSelected && <Check className="dispatch-period-selected-icon" size={20} aria-hidden="true" />}<Icon size={24} aria-hidden="true" /><span className="dispatch-period-label" style={{ fontSize: '22px' }}>{deliveryPeriods[value].label}</span><small>จัด{deliveryPeriods[value].deliveryTime}</small></button> })}</section>
    <section className="dispatch-summary" aria-label="สรุปรอบส่ง"><div><span className="dispatch-summary-icon"><UsersRound size={27} aria-hidden="true" /></span><span className="dispatch-summary-content"><small>ลูกค้าทั้งหมด</small><strong style={{ fontSize: '22px' }}>{orders.length} คน</strong></span></div><div><span className="dispatch-summary-icon"><Banknote size={27} aria-hidden="true" /></span><span className="dispatch-summary-content"><small>ยอดรวมทั้งหมด</small><strong style={{ fontSize: '22px' }}>{formatPrice(total)}</strong></span></div><div><span className="dispatch-summary-icon"><MapPin size={27} aria-hidden="true" /></span><span className="dispatch-summary-content"><small>จุดรับสินค้า</small><strong style={{ fontSize: '22px' }}>{locations.length} จุด</strong></span></div></section>
    <section className="dispatch-total-card"><div><h2><PackageOpen size={22} aria-hidden="true" />รวมของที่ต้องเตรียม</h2><p>นับจากทุกสถานที่ใน{deliveryPeriods[period].label}</p></div><ul>{totalItems.map((item) => <li key={item.name} className={itemToneClass(item.name)}><span>{item.name}</span><strong>{item.quantity} {item.unitName}</strong></li>)}</ul></section>
    {locations.length ? <div className="dispatch-location-grid">{locations.map((group) => <article className="dispatch-location-card" key={group.locationId}><div className="dispatch-location-heading"><div><span className="dispatch-location-icon"><MapPin size={20} aria-hidden="true" /></span><div><h2>{group.locationName}</h2><p>{group.orders.length} คน ยอดรวม {formatPrice(group.total)}</p></div></div></div><div className="dispatch-items">{group.items.map((item) => <p key={item.name}><span>{item.name}</span><strong>{item.quantity} {item.unitName}</strong></p>)}</div><details><summary>ดูรายชื่อลูกค้า <ChevronRight size={22} aria-hidden="true" /></summary><ul>{group.orders.map((order) => <li key={order.id}><div className="dispatch-customer-order-detail"><div className="dispatch-customer-order-header"><Link to={`/admin/orders/${order.id}`}>{order.orderNumber}</Link><span>{order.userName}</span></div><p className="dispatch-customer-order-total">{formatPrice(order.totalAmount)}</p></div><span className={`admin-status ${orderStatusClass(order.orderStatus)}`}>{orderStatusLabel(order.orderStatus)}</span></li>)}</ul></details><button type="button" className="admin-primary-button dispatch-confirm-button" disabled={updateStatusMutation.isPending} onClick={() => updateLocationStatuses(group.locationName, group.orders)}><Check size={18} aria-hidden="true" />เปลี่ยนสถานะ ส่งแล้ว</button></article>)}</div> : <p className="dispatch-empty">{emptyMessage}</p>}
    <p className="admin-page-note dispatch-page-note"><CalendarDays size={18} aria-hidden="true" /> ข้อมูลหน้านี้เป็นรอบส่งของวันที่ {deliveryDateLabel(date)} ({deliveryPeriods[period].label})</p>
  </section>
}
