import { Check, ChevronRight, ClipboardCheck, MapPin, PackageOpen, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deliveryPeriods, formatPrice, getOrderTotal, mockOrders, type DeliveryPeriod } from '@/features/admin/orders/order-data'

type DispatchState = 'เตรียมของแล้ว' | 'ออกส่งแล้ว' | 'ส่งครบแล้ว'

const dispatchStateOrder: DispatchState[] = ['เตรียมของแล้ว', 'ออกส่งแล้ว', 'ส่งครบแล้ว']

export function DispatchTodayPage() {
  const [period, setPeriod] = useState<DeliveryPeriod>('morning')
  const [checked, setChecked] = useState<Record<string, DispatchState>>({})
  const orders = mockOrders.filter((order) => order.deliveryDate === '2026-07-20' && order.period === period && order.status !== 'ยกเลิก')
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
  const nextState = (location: string) => {
    const current = checked[location]
    const index = current ? dispatchStateOrder.indexOf(current) : -1
    setChecked((states) => ({ ...states, [location]: dispatchStateOrder[Math.min(index + 1, dispatchStateOrder.length - 1)] }))
  }

  return <section className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">สรุปเพื่อเตรียมของและออกส่ง</p><h1 className="admin-title">รอบส่งวันนี้</h1></div><Link className="admin-secondary-button" to="/admin/orders">ดูออเดอร์รายรายการ</Link></div>
    <section className="dispatch-period-picker" aria-label="เลือกรอบจัดส่ง">{(Object.keys(deliveryPeriods) as DeliveryPeriod[]).map((value) => <button type="button" key={value} className={period === value ? 'active' : ''} aria-pressed={period === value} onClick={() => setPeriod(value)}><span>{deliveryPeriods[value].label}</span><small>{deliveryPeriods[value].deliveryTime}</small></button>)}</section>
    <section className="dispatch-summary"><div><small>ลูกค้าทั้งหมด</small><strong>{orders.length} คน</strong></div><div><small>ยอดรวมรอบนี้</small><strong>{formatPrice(total)}</strong></div><div><small>จุดรับสินค้า</small><strong>{locations.length} จุด</strong></div><div><small>สถานะรอบ</small><strong>{deliveryPeriods[period].label}</strong><span>{deliveryPeriods[period].deliveryTime}</span></div></section>
    <section className="dispatch-total-card"><div><h2><PackageOpen size={22} aria-hidden="true" />รวมของที่ต้องเตรียม</h2><p>นับจากทุกสถานที่ใน{deliveryPeriods[period].label}</p></div><ul>{totalItems.map(([name, item]) => <li key={name}><span>{name}</span><strong>{item.quantity} {item.unit}</strong></li>)}</ul></section>
    <div className="dispatch-location-grid">{locations.map((group) => <article className="dispatch-location-card" key={group.location}><div className="dispatch-location-heading"><div><span className="dispatch-location-icon"><MapPin size={20} aria-hidden="true" /></span><div><h2>{group.location}</h2><p>{group.orders.length} คน · {formatPrice(group.total)}</p></div></div><span className={`admin-status ${checked[group.location] === 'ส่งครบแล้ว' ? 'success' : checked[group.location] === 'ออกส่งแล้ว' ? 'delivering' : 'preparing'}`}>{checked[group.location] ?? 'รอเตรียม'}</span></div><div className="dispatch-items">{group.items.map(([name, item]) => <p key={name}><span>{name}</span><strong>{item.quantity} {item.unit}</strong></p>)}</div><details><summary>ดูรายชื่อลูกค้า <ChevronRight size={17} aria-hidden="true" /></summary><ul>{group.orders.map((order) => <li key={order.id}><span>{order.customerName}</span><Link to={`/admin/orders/${order.id}`}>{order.id}</Link></li>)}</ul></details><button type="button" className="admin-primary-button" onClick={() => nextState(group.location)}><Truck size={18} aria-hidden="true" />{checked[group.location] ? checked[group.location] === 'ส่งครบแล้ว' ? 'ส่งครบแล้ว' : 'อัปเดตเป็นขั้นถัดไป' : 'ยืนยันเตรียมของแล้ว'}{checked[group.location] === 'ส่งครบแล้ว' && <Check size={18} aria-hidden="true" />}</button></article>)}</div>
    <p className="admin-page-note"><ClipboardCheck size={18} aria-hidden="true" /> ข้อมูลหน้านี้เป็นภาพรวมของวันที่ 20 ก.ค. 2569 สำหรับการออกแบบหน้าปฏิบัติการ</p>
  </section>
}
