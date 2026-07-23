import { Check, ChevronRight, ClipboardCheck, CookingPot as Flame, ListChecks, MapPin, PackageOpen, Trash2, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminProducts } from '@/features/admin/product/admin-products'
import { deliveryPeriods, formatPrice, getOrderTotal, type AdminOrder, type DeliveryPeriod } from '@/features/admin/orders/order-data'
import { usePreparationStore, type PreparationBatch } from './preparation-store'

function getItemPieceCount(name: string, quantity: number) {
  return quantity * (adminProducts.find((candidate) => candidate.name === name)?.piecesPerStick ?? 1)
}

function getOrderItems(orders: AdminOrder[]) {
  const items = new Map<string, { quantity: number; unit: string }>()
  orders.forEach((order) => order.items.forEach((item) => {
    const current = items.get(item.name) ?? { quantity: 0, unit: item.unit }
    items.set(item.name, { ...current, quantity: current.quantity + item.quantity })
  }))
  return Array.from(items.entries()).map(([name, item]) => {
    return { name, ...item, pieces: getItemPieceCount(name, item.quantity) }
  })
}

function getBatchOrders(batch: PreparationBatch, orders: AdminOrder[]) {
  return orders.filter((order) => batch.orderIds.includes(order.id))
}

export function PreparationBoard() {
  const { orders, batches, createBatch, markBatchReady, removeOrderFromBatch } = usePreparationStore()
  const [date, setDate] = useState('2026-07-20')
  const [period, setPeriod] = useState<DeliveryPeriod>('morning')
  const [location, setLocation] = useState('all')
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const locations = useMemo(() => Array.from(new Set(orders.map((order) => order.location))), [orders])
  const paidQueue = orders.filter((order) => (
    order.deliveryDate === date
    && order.period === period
    && order.paymentStatus === 'จ่ายแล้ว'
    && order.status === 'รอตรวจสอบ'
    && (location === 'all' || order.location === location)
  ))
  const visibleBatches = batches.filter((batch) => batch.deliveryDate === date && batch.period === period)
  const preparingBatches = visibleBatches.filter((batch) => batch.status === 'preparing')
  const readyBatches = visibleBatches.filter((batch) => batch.status === 'ready')
  const allQueueSelected = paidQueue.length > 0 && paidQueue.every((order) => selectedOrderIds.includes(order.id))
  const selectedQueueCount = selectedOrderIds.filter((id) => paidQueue.some((order) => order.id === id)).length

  function toggleOrder(orderId: string) {
    setSelectedOrderIds((current) => current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId])
  }

  function toggleAll() {
    const queueIds = paidQueue.map((order) => order.id)
    setSelectedOrderIds((current) => allQueueSelected ? current.filter((id) => !queueIds.includes(id)) : [...new Set([...current, ...queueIds])])
  }

  function handleCreateBatch() {
    createBatch(date, period, selectedOrderIds)
    setSelectedOrderIds([])
  }

  function changePeriod(value: DeliveryPeriod) {
    setPeriod(value)
    setSelectedOrderIds([])
  }

  return <section className="admin-page preparation-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">เตรียมของ</h1><p className="preparation-page-intro">จัดออเดอร์ที่จ่ายแล้วเป็นรอบเตรียมของ โดยไม่หักสต็อกซ้ำ</p></div><Link to="/admin/orders" className="admin-secondary-button"><ClipboardCheck size={18} aria-hidden="true" />รายการสั่งซื้อ</Link></div>
    <section className="preparation-filter" aria-label="ตัวกรองรอบเตรียมของ"><label>วันจัดส่ง<Input type="date" value={date} onChange={(event) => { setDate(event.target.value); setSelectedOrderIds([]) }} /></label><label>รอบส่ง<Select value={period} onValueChange={(value) => changePeriod(value as DeliveryPeriod)}><SelectTrigger aria-label="เลือกรอบส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="morning">รอบเช้า</SelectItem><SelectItem value="afternoon">รอบบ่าย</SelectItem></SelectContent></Select></label><label>จุดรับสินค้า<Select value={location} onValueChange={(value) => { setLocation(value); setSelectedOrderIds([]) }}><SelectTrigger aria-label="เลือกจุดรับสินค้า"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทุกจุดรับ</SelectItem>{locations.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label></section>

    <section className="preparation-queue" aria-labelledby="preparation-queue-title"><div className="preparation-section-heading"><div><h2 id="preparation-queue-title"><UsersRound size={21} aria-hidden="true" />คิวที่ชำระเงินแล้ว</h2><p>เลือกออเดอร์ที่ต้องการจัดเตรียมใน{deliveryPeriods[period].label}</p></div><button type="button" className="preparation-create-button" disabled={!selectedQueueCount} onClick={handleCreateBatch}><Flame size={18} aria-hidden="true" />สร้างรอบเตรียมของ {selectedQueueCount ? `(${selectedQueueCount})` : ''}</button></div>{paidQueue.length ? <div className="preparation-queue-list"><label className="preparation-select-all"><input type="checkbox" checked={allQueueSelected} onChange={toggleAll} />เลือกทั้งหมด</label>{paidQueue.map((order) => <label className="preparation-queue-order" key={order.id}><input type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={() => toggleOrder(order.id)} /><span><strong>{order.id}</strong><small>{order.customerName} · {order.location} · {formatPrice(getOrderTotal(order))}</small></span><span className="preparation-order-items">{order.items.map((item) => `${item.name} ${item.quantity} ${item.unit} · ${getItemPieceCount(item.name, item.quantity)} ชิ้น`).join(', ')}</span></label>)}</div> : <p className="preparation-empty">ไม่มีออเดอร์ที่จ่ายแล้วและรอจัดเตรียมในตัวกรองนี้</p>}</section>

    <section className="preparation-batches" aria-labelledby="preparation-batches-title"><div className="preparation-section-heading"><div><h2 id="preparation-batches-title"><Flame size={21} aria-hidden="true" />รอบเตรียมของ</h2><p>เปลี่ยนสถานะได้เฉพาะ “เตรียมของ” และ “พร้อมส่ง”</p></div></div>{preparingBatches.length ? <div className="preparation-batch-grid">{preparingBatches.map((batch, index) => { const batchOrders = getBatchOrders(batch, orders); const items = getOrderItems(batchOrders); return <article key={batch.id} className="preparation-batch-card"><div className="preparation-batch-heading"><div><h3>รอบเตรียมของ {index + 1}</h3><p>{batchOrders.length} คน · สร้างเมื่อ {batch.createdAt}</p></div><span className="preparation-status preparing">เตรียมของ</span></div><div className="preparation-item-summary"><h4><PackageOpen size={18} aria-hidden="true" />ของที่ต้องเตรียม</h4><ul>{items.map((item) => <li key={item.name}><span>{item.name}</span><strong>{item.quantity} {item.unit} <small>· {item.pieces} ชิ้น</small></strong></li>)}</ul></div><details><summary>ดูของที่ลูกค้าแต่ละคนสั่ง <ChevronRight size={17} aria-hidden="true" /></summary><ul className="preparation-customer-list">{batchOrders.map((order) => <li key={order.id}><div><strong>{order.customerName}</strong><small>{order.id} · {order.location}</small></div><p>{order.items.map((item) => `${item.name} ${item.quantity} ${item.unit} · ${getItemPieceCount(item.name, item.quantity)} ชิ้น`).join(', ')}</p><button type="button" aria-label={`นำ ${order.customerName} ออกจากรอบเตรียมของ`} onClick={() => removeOrderFromBatch(batch.id, order.id)}><Trash2 size={16} aria-hidden="true" />นำออก</button></li>)}</ul></details><button type="button" className="preparation-ready-button" onClick={() => markBatchReady(batch.id)}><Check size={18} aria-hidden="true" />เปลี่ยนทุกคนเป็น พร้อมส่ง</button></article> })}</div> : <p className="preparation-empty">ยังไม่มีรอบที่กำลังเตรียม เลือกออเดอร์จากคิวด้านบนเพื่อสร้างรอบ</p>}</section>

    {readyBatches.length > 0 && <section className="preparation-ready-history" aria-labelledby="preparation-ready-title"><div className="preparation-section-heading"><div><h2 id="preparation-ready-title"><ListChecks size={21} aria-hidden="true" />รอบที่พร้อมส่ง</h2><p>รอบเหล่านี้ล็อกแล้วเพื่อป้องกันการแก้ไขรายการ</p></div></div><ul>{readyBatches.map((batch) => <li key={batch.id}><span><strong>{getBatchOrders(batch, orders).length} คน</strong><small>{deliveryPeriods[batch.period].label} · {batch.createdAt}</small></span><span className="preparation-status ready">พร้อมส่ง</span></li>)}</ul></section>}
  </section>
}
