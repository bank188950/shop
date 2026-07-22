import { Banknote, CalendarDays, Check, ChevronRight, ListChecks, MapPin, PackageOpen, Repeat2, Sun, Sunset, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { deliveryPeriods, formatPrice, getOrderListStatus, getOrderTotal, mockOrders, orderListStatuses, statusClass, type AdminOrder, type DeliveryPeriod, type OrderStatus } from '@/features/admin/orders/order-data'

const dispatchStatusOptions = orderListStatuses.filter((status) => status !== 'รอชำระเงิน' && status !== 'ยกเลิก')

function DispatchStatusSelect({ onValueChange }: { onValueChange: (value: string) => void }) {
  return <Select onValueChange={onValueChange}><SelectTrigger className="min-h-12 text-base" aria-label="เลือกสถานะใหม่"><SelectValue placeholder="เลือกสถานะ" /></SelectTrigger><SelectContent className="z-[1100]">{dispatchStatusOptions.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select>
}

export function DispatchTodayPage() {
  const [period, setPeriod] = useState<DeliveryPeriod>('morning')
  const [ordersData, setOrdersData] = useState<AdminOrder[]>(mockOrders)
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
    let selectedStatus = ''
    let selectRoot: Root | undefined
    const result = await Swal.fire({
      title: 'เปลี่ยนสถานะรายการสั่งซื้อ',
      text: `เลือกสถานะใหม่สำหรับ ${locationOrders.length} รายการสั่งซื้อ`,
      html: '<div id="dispatch-status-select"></div>',
      showCancelButton: true,
      confirmButtonText: 'เปลี่ยนสถานะ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#7b393e',
      cancelButtonColor: '#607168',
      reverseButtons: true,
      focusCancel: true,
      didOpen: () => {
        const container = Swal.getHtmlContainer()?.querySelector('#dispatch-status-select')
        if (!container) return
        selectRoot = createRoot(container)
        selectRoot.render(<DispatchStatusSelect onValueChange={(value) => { selectedStatus = value; Swal.resetValidationMessage() }} />)
      },
      willClose: () => selectRoot?.unmount(),
      preConfirm: () => {
        if (!selectedStatus) Swal.showValidationMessage('กรุณาเลือกสถานะใหม่')
        return selectedStatus
      },
    })
    if (!result.value) return

    const locationOrderIds = new Set(locationOrders.map((order) => order.id))
    setOrdersData((current) => current.map((order) => locationOrderIds.has(order.id) ? { ...order, status: result.value as OrderStatus } : order))
  }

  return <section className="admin-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">รอบส่งวันนี้</h1></div><Link className="admin-secondary-button" to="/admin/orders"><Repeat2 size={18} aria-hidden="true" />ดูรายการสั่งซื้อ</Link></div>
    <section className="dispatch-period-picker" aria-label="เลือกรอบจัดส่ง">{(Object.keys(deliveryPeriods) as DeliveryPeriod[]).map((value) => { const Icon = value === 'morning' ? Sun : Sunset; const isSelected = period === value; return <button type="button" key={value} className={`${value} ${isSelected ? 'active' : ''}`} aria-pressed={isSelected} onClick={() => setPeriod(value)}>{isSelected && <Check className="dispatch-period-selected-icon" size={20} aria-hidden="true" />}<Icon size={24} aria-hidden="true" /><span>{deliveryPeriods[value].label}</span><small>จัด{deliveryPeriods[value].deliveryTime}</small></button> })}</section>
    <section className="dispatch-summary" aria-label="สรุปรอบส่ง"><div><span className="dispatch-summary-icon"><UsersRound size={27} aria-hidden="true" /></span><span className="dispatch-summary-content"><small>ลูกค้าทั้งหมด</small><strong>{orders.length} คน</strong></span></div><div><span className="dispatch-summary-icon"><Banknote size={27} aria-hidden="true" /></span><span className="dispatch-summary-content"><small>ยอดรวมทั้งหมด</small><strong>{formatPrice(total)}</strong></span></div><div><span className="dispatch-summary-icon"><MapPin size={27} aria-hidden="true" /></span><span className="dispatch-summary-content"><small>จุดรับสินค้า</small><strong>{locations.length} จุด</strong></span></div></section>
    <section className="dispatch-total-card"><div><h2><PackageOpen size={22} aria-hidden="true" />รวมของที่ต้องเตรียม</h2><p>นับจากทุกสถานที่ใน{deliveryPeriods[period].label}</p></div><ul>{totalItems.map(([name, item]) => <li key={name} className={name.includes('น้ำ') ? 'drink' : name.includes('ไส้กรอก') ? 'sausage' : name.includes('เนื้อ') ? 'beef' : 'pork'}><span>{name}</span><strong>{item.quantity} {item.unit}</strong></li>)}</ul></section>
    <div className="dispatch-location-grid">{locations.map((group) => <article className="dispatch-location-card" key={group.location}><div className="dispatch-location-heading"><div><span className="dispatch-location-icon"><MapPin size={20} aria-hidden="true" /></span><div><h2>{group.location}</h2><p>{group.orders.length} คน : {formatPrice(group.total)}</p></div></div></div><div className="dispatch-items">{group.items.map(([name, item]) => <p key={name}><span>{name}</span><strong>{item.quantity} {item.unit}</strong></p>)}</div><details><summary>ดูรายชื่อลูกค้า <ChevronRight size={17} aria-hidden="true" /></summary><ul>{group.orders.map((order) => <li key={order.id}><Link to={`/admin/orders/${order.id}`}>{order.id}</Link><span>{order.customerName}</span><span className={`admin-status ${statusClass(getOrderListStatus(order))}`}>{getOrderListStatus(order)}</span></li>)}</ul></details><button type="button" className="admin-primary-button" onClick={() => updateLocationStatuses(group.orders)}><ListChecks size={18} aria-hidden="true" />เลือกสถานะ</button></article>)}</div>
    <p className="admin-page-note dispatch-page-note"><CalendarDays size={18} aria-hidden="true" /> ข้อมูลหน้านี้เป็นรอบส่งของวันที่ 20 ก.ค. 2569 ({deliveryPeriods[period].label})</p>
  </section>
}
