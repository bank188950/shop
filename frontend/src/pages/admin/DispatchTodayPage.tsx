import { Banknote, CalendarDays, Check, ChevronRight, MapPin, PackageOpen, Repeat2, Sun, Sunset, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { deliveryPeriods, formatPrice, getOrderListStatus, getOrderTotal, statusClass, type AdminOrder, type DeliveryPeriod } from '@/features/admin/orders/order-data'
import { usePreparationStore } from '@/features/admin/preparation/preparation-store'

export function DispatchTodayPage() {
  const [period, setPeriod] = useState<DeliveryPeriod>('morning')
  const { orders: ordersData, setOrdersStatus } = usePreparationStore()
  const orders = ordersData.filter((order) => order.deliveryDate === '2026-07-20' && order.period === period && order.paymentStatus === 'จ่ายแล้ว' && order.status !== 'ยกเลิก')
  const locations = useMemo(() => Array.from(new Set(orders.map((order) => order.location))).map((location) => {
    const locationOrders = orders.filter((order) => order.location === location)
    const items = new Map<string, { quantity: number; unit: string }>()
    locationOrders.forEach((order) => order.items.forEach((item) => {
      const current = items.get(item.name) ?? { quantity: 0, unit: item.unit }
      items.set(item.name, { ...current, quantity: current.quantity + item.quantity })
    }))
    return { location, orders: locationOrders, total: locationOrders.reduce((sum, order) => sum + getOrderTotal(order), 0), items: Array.from(items.entries()) }
  }), [orders])
  const total = orders.reduce((sum, order) => sum + getOrderTotal(order), 0)
  const totalItems = useMemo(() => {
    const items = new Map<string, { quantity: number; unit: string }>()
    orders.forEach((order) => order.items.forEach((item) => {
      const current = items.get(item.name) ?? { quantity: 0, unit: item.unit }
      items.set(item.name, { ...current, quantity: current.quantity + item.quantity })
    }))
    return Array.from(items.entries())
  }, [orders])
  async function updateLocationStatuses(locationOrders: AdminOrder[]) {
    const hasIncompletePreparation = locationOrders.some((order) => order.status !== 'พร้อมส่ง')

    if (hasIncompletePreparation) {
      await Swal.fire({
        title: 'ยังไม่พร้อมเปลี่ยนสถานะ',
        html: 'ไม่สามารถเปลี่ยนสถานะเป็นส่งแล้วได้<span class="dispatch-warning-message-line">เนื่องจากยังมีรายการที่ยังไม่พร้อมส่ง</span>',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#607168',
        customClass: { icon: 'dispatch-warning-alert-icon' },
      })
      return
    }

    const result = await Swal.fire({
      title: 'ยืนยันการส่งสินค้า',
      text: `ต้องการเปลี่ยนสถานะ ${locationOrders.length} รายการของ ${locationOrders[0].location} เป็นส่งแล้ว`,
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

    setOrdersStatus(locationOrders.map((order) => order.id), 'ส่งแล้ว')
  }

  return <section className="admin-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">รอบส่งวันนี้</h1></div><Link className="admin-secondary-button" to="/admin/orders"><Repeat2 size={18} aria-hidden="true" />ดูรายการสั่งซื้อ</Link></div>
    <section className="dispatch-period-picker" aria-label="เลือกรอบจัดส่ง">{(Object.keys(deliveryPeriods) as DeliveryPeriod[]).map((value) => { const Icon = value === 'morning' ? Sun : Sunset; const isSelected = period === value; return <button type="button" key={value} className={`${value} ${isSelected ? 'active' : ''}`} aria-pressed={isSelected} onClick={() => setPeriod(value)}>{isSelected && <Check className="dispatch-period-selected-icon" size={20} aria-hidden="true" />}<Icon size={24} aria-hidden="true" /><span className="dispatch-period-label" style={{ fontSize: '22px' }}>{deliveryPeriods[value].label}</span><small>จัด{deliveryPeriods[value].deliveryTime}</small></button> })}</section>
    <section className="dispatch-summary" aria-label="สรุปรอบส่ง"><div><span className="dispatch-summary-icon"><UsersRound size={27} aria-hidden="true" /></span><span className="dispatch-summary-content"><small>ลูกค้าทั้งหมด</small><strong style={{ fontSize: '22px' }}>{orders.length} คน</strong></span></div><div><span className="dispatch-summary-icon"><Banknote size={27} aria-hidden="true" /></span><span className="dispatch-summary-content"><small>ยอดรวมทั้งหมด</small><strong style={{ fontSize: '22px' }}>{formatPrice(total)}</strong></span></div><div><span className="dispatch-summary-icon"><MapPin size={27} aria-hidden="true" /></span><span className="dispatch-summary-content"><small>จุดรับสินค้า</small><strong style={{ fontSize: '22px' }}>{locations.length} จุด</strong></span></div></section>
    <section className="dispatch-total-card"><div><h2><PackageOpen size={22} aria-hidden="true" />รวมของที่ต้องเตรียม</h2><p>นับจากทุกสถานที่ใน{deliveryPeriods[period].label}</p></div><ul>{totalItems.map(([name, item]) => <li key={name} className={name.includes('น้ำ') ? 'drink' : name.includes('ไส้กรอก') ? 'sausage' : name.includes('เนื้อ') ? 'beef' : 'pork'}><span>{name}</span><strong>{item.quantity} {item.unit}</strong></li>)}</ul></section>
    <div className="dispatch-location-grid">{locations.map((group) => <article className="dispatch-location-card" key={group.location}><div className="dispatch-location-heading"><div><span className="dispatch-location-icon"><MapPin size={20} aria-hidden="true" /></span><div><h2>{group.location}</h2><p>{group.orders.length} คน ยอดรวม {formatPrice(group.total)}</p></div></div></div><div className="dispatch-items">{group.items.map(([name, item]) => <p key={name}><span>{name}</span><strong>{item.quantity} {item.unit}</strong></p>)}</div><details><summary>ดูรายชื่อลูกค้า <ChevronRight size={22} aria-hidden="true" /></summary><ul>{group.orders.map((order) => <li key={order.id}><Link to={`/admin/orders/${order.id}`}>{order.id}</Link><span>{order.customerName}</span><span className={`admin-status ${statusClass(getOrderListStatus(order))}`}>{getOrderListStatus(order)}</span></li>)}</ul></details><button type="button" className="admin-primary-button dispatch-confirm-button" onClick={() => updateLocationStatuses(group.orders)}><Check size={18} aria-hidden="true" />เปลี่ยนสถานะ ส่งแล้ว</button></article>)}</div>
    <p className="admin-page-note dispatch-page-note"><CalendarDays size={18} aria-hidden="true" /> ข้อมูลหน้านี้เป็นรอบส่งของวันที่ 20 ก.ค. 2569 ({deliveryPeriods[period].label})</p>
  </section>
}
