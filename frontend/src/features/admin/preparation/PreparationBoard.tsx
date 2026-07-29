import { Check, ChevronRight, CircleCheck, ClipboardCheck, CookingPot as Flame, ListChecks, PackageOpen, Truck, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThaiDatePicker } from '@/components/ui/thai-date-picker'
import { deliveryPeriods, formatPrice, orderedAtLabel, todayIsoDate } from '@/features/admin/orders/utils/order-labels'
import {
  useCreatePreparationBatch,
  useMarkPreparationBatchReady,
  useMarkPreparationOrdersDelivered,
  usePreparationBoard,
  useRemovePreparationBatchOrder,
} from './hooks/usePreparationBoard'
import type { AdminDeliveryPeriod } from '@/api/admin/orders'
import type { PreparationOrder } from '@/api/admin/preparations'

/** รวมสินค้าของทุกรายการสั่งซื้อในรอบเป็นยอดเดียว เพื่อใช้เป็นใบสรุปของที่ต้องเตรียม */
function getOrderItems(orders: PreparationOrder[]) {
  const items = new Map<string, { name: string, unitName: string, quantity: number, pieces: number }>()
  orders.forEach((order) => order.items.forEach((item) => {
    const current = items.get(item.name) ?? { name: item.name, unitName: item.unitName, quantity: 0, pieces: 0 }
    items.set(item.name, { ...current, quantity: current.quantity + item.quantity, pieces: current.pieces + item.pieces })
  }))
  return Array.from(items.values())
}

function showMutationError(title: string, error: unknown) {
  Swal.fire({ icon: 'error', title, text: error instanceof Error ? error.message : 'ไม่สามารถบันทึกการเปลี่ยนแปลงได้', confirmButtonText: 'ตกลง', confirmButtonColor: '#7b393e' })
}

export function PreparationBoard() {
  const [date, setDate] = useState(todayIsoDate)
  const [period, setPeriod] = useState<AdminDeliveryPeriod>('morning')
  const [locationId, setLocationId] = useState<'all' | number>('all')
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([])
  const filters = useMemo(() => ({ deliveryDate: date, deliveryPeriod: period, locationId }), [date, locationId, period])
  const boardQuery = usePreparationBoard(filters)
  const createBatchMutation = useCreatePreparationBatch()
  const markReadyMutation = useMarkPreparationBatchReady()
  const removeOrderMutation = useRemovePreparationBatchOrder()
  const markDeliveredMutation = useMarkPreparationOrdersDelivered()
  const paidQueue = boardQuery.data?.queue ?? []
  const batches = boardQuery.data?.batches ?? []
  const deliveryGroups = boardQuery.data?.deliveryGroups ?? []
  const locations = boardQuery.data?.locations ?? []
  const allQueueSelected = paidQueue.length > 0 && paidQueue.every((order) => selectedOrderIds.includes(order.id))
  const selectedQueueOrders = paidQueue.filter((order) => selectedOrderIds.includes(order.id))

  // จุดรับที่เลือกไว้อาจไม่มีรายการสั่งซื้อในวันหรือรอบที่เพิ่งเลือก จึงต้องคืนค่าเป็นทุกจุดรับไม่ให้ตัวกรองค้าง
  useEffect(() => {
    if (!boardQuery.data || boardQuery.isPlaceholderData || locationId === 'all') return
    if (!locations.some((location) => location.id === locationId)) setLocationId('all')
  }, [boardQuery.data, boardQuery.isPlaceholderData, locationId, locations])

  function toggleOrder(orderId: number) {
    setSelectedOrderIds((current) => current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId])
  }

  function toggleAll() {
    const queueIds = paidQueue.map((order) => order.id)
    setSelectedOrderIds((current) => allQueueSelected ? current.filter((id) => !queueIds.includes(id)) : [...new Set([...current, ...queueIds])])
  }

  async function handleCreateBatch() {
    if (!selectedQueueOrders.length) return

    if (new Set(selectedQueueOrders.map((order) => order.locationId)).size > 1) {
      const result = await Swal.fire({
        title: 'เตรียมสินค้าที่เลือกมีหลายสถานที่',
        text: 'คุณต้องการเตรียมสินค้าที่มีสถานที่ต่างกันใช่ไหม',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#075b3c',
        cancelButtonColor: '#607168',
        reverseButtons: true,
        focusCancel: true,
        customClass: { icon: 'preparation-multi-location-alert-icon' },
      })

      if (!result.isConfirmed) return
    }

    try {
      await createBatchMutation.mutateAsync({ filters, orderIds: selectedQueueOrders.map((order) => order.id) })
      setSelectedOrderIds([])
    } catch (error) {
      showMutationError('สร้างรอบเตรียมสินค้าไม่สำเร็จ', error)
    }
  }

  async function removeOrderFromBatch(batchId: number, order: PreparationOrder) {
    const result = await Swal.fire({
      title: 'นำรายการออกจากรอบเตรียมสินค้า?',
      text: `ต้องการนำ ${order.orderNumber} ของ${order.userName} ออกจากรอบนี้หรือไม่`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#c73b34',
      cancelButtonColor: '#607168',
      reverseButtons: true,
      focusCancel: true,
      customClass: { icon: 'preparation-remove-alert-icon' },
    })
    if (!result.isConfirmed) return

    try {
      await removeOrderMutation.mutateAsync({ batchId, orderId: order.id })
    } catch (error) {
      showMutationError('นำรายการออกจากรอบไม่สำเร็จ', error)
    }
  }

  async function markBatchReady(batchId: number, orderCount: number) {
    const result = await Swal.fire({
      title: 'เปลี่ยนสถานะเป็นพร้อมส่ง?',
      text: `ยืนยันเปลี่ยนสถานะลูกค้า ${orderCount} คน เป็นพร้อมส่ง`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#075b3c',
      cancelButtonColor: '#607168',
      reverseButtons: true,
      focusCancel: true,
      customClass: { icon: 'preparation-ready-alert-icon' },
    })
    if (!result.isConfirmed) return

    try {
      await markReadyMutation.mutateAsync(batchId)
    } catch (error) {
      showMutationError('เปลี่ยนสถานะเป็นพร้อมส่งไม่สำเร็จ', error)
    }
  }

  async function markLocationDelivered(locationName: string, groupOrders: PreparationOrder[]) {
    const deliverableOrders = groupOrders.filter((order) => order.orderStatus === 'ready_for_delivery')
    if (!deliverableOrders.length) return

    const result = await Swal.fire({
      title: 'ยืนยันการส่งสินค้า',
      text: `ยืนยันเปลี่ยนสถานะลูกค้า ${deliverableOrders.length} คน ที่${locationName} เป็นส่งแล้ว`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#075b3c',
      cancelButtonColor: '#607168',
      reverseButtons: true,
      focusCancel: true,
      customClass: { icon: 'preparation-ready-alert-icon' },
    })
    if (!result.isConfirmed) return

    try {
      await markDeliveredMutation.mutateAsync(deliverableOrders.map((order) => order.id))
    } catch (error) {
      showMutationError('เปลี่ยนสถานะเป็นส่งแล้วไม่สำเร็จ', error)
    }
  }

  function changePeriod(value: AdminDeliveryPeriod) {
    setPeriod(value)
    setSelectedOrderIds([])
  }

  const queueMessage = boardQuery.isLoading ? 'กำลังโหลดคิวที่ชำระเงินแล้ว...'
    : boardQuery.isError ? `ไม่สามารถโหลดคิวได้: ${boardQuery.error.message}`
      : 'ไม่มีออเดอร์ที่จ่ายแล้วและรอจัดเตรียมในตัวกรองนี้'
  const batchMessage = boardQuery.isLoading ? 'กำลังโหลดรอบเตรียมสินค้า...'
    : boardQuery.isError ? 'ไม่สามารถโหลดรอบเตรียมสินค้าได้'
      : 'ยังไม่มีรอบที่กำลังเตรียม เลือกออเดอร์จากคิวด้านบนเพื่อสร้างรอบ'

  return <section className="admin-page preparation-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">เตรียมสินค้า</h1></div><Link to="/admin/orders" className="admin-secondary-button"><ClipboardCheck size={18} aria-hidden="true" />รายการสั่งซื้อ</Link></div>
    <section className="preparation-filter" aria-label="ตัวกรองรอบเตรียมสินค้า"><label>วันจัดส่ง<ThaiDatePicker value={date} onValueChange={(value) => { setDate(value); setSelectedOrderIds([]) }} ariaLabel="เลือกวันจัดส่ง" /></label><label>รอบส่ง<Select value={period} onValueChange={(value) => changePeriod(value as AdminDeliveryPeriod)}><SelectTrigger aria-label="เลือกรอบส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="morning">รอบเช้า</SelectItem><SelectItem value="afternoon">รอบบ่าย</SelectItem></SelectContent></Select></label><label>จุดรับสินค้า<Select value={String(locationId)} onValueChange={(value) => { setLocationId(value === 'all' ? 'all' : Number(value)); setSelectedOrderIds([]) }}><SelectTrigger aria-label="เลือกจุดรับสินค้า"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทุกจุดรับ</SelectItem>{locations.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></label></section>

    <section className="preparation-queue" aria-labelledby="preparation-queue-title">
      <div className="preparation-section-heading">
        <div><h2 id="preparation-queue-title"><ListChecks size={21} aria-hidden="true" />คิวที่ชำระเงินแล้ว</h2><p>เลือกออเดอร์ที่ต้องการจัดเตรียมใน{deliveryPeriods[period].label}</p></div>
        <button type="button" className="preparation-create-button" disabled={!selectedQueueOrders.length || createBatchMutation.isPending} onClick={handleCreateBatch}><Flame size={18} aria-hidden="true" />สร้างรอบเตรียมสินค้า {selectedQueueOrders.length ? `(${selectedQueueOrders.length})` : ''}</button>
      </div>
      {paidQueue.length ? <div className="preparation-queue-list">
        <div className="preparation-queue-selection-bar">
          <label className="preparation-select-all"><input type="checkbox" checked={allQueueSelected} onChange={toggleAll} />เลือกทั้งหมด</label>
          <span className={`preparation-period-badge ${period}`}>{deliveryPeriods[period].label}</span>
        </div>
        {paidQueue.map((order) => <label className="preparation-queue-order" key={order.id}>
          <input type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={() => toggleOrder(order.id)} />
          <span><strong>{order.orderNumber}</strong><small>{order.userName} · {order.locationName} · {formatPrice(order.totalAmount)}</small></span>
          <span className="preparation-order-items">{order.items.map((item) => <span key={item.name}>{item.name} {item.quantity} {item.unitName}{item.pieces > 0 && <> · <span className="preparation-item-pieces">{item.pieces} ชิ้น</span></>}</span>)}</span>
        </label>)}
      </div> : <p className="preparation-empty">{queueMessage}</p>}
    </section>

    <section className="preparation-batches" aria-labelledby="preparation-batches-title"><div className="preparation-section-heading"><div><h2 id="preparation-batches-title"><Flame size={21} aria-hidden="true" />รอบเตรียมสินค้า <span className="preparation-status preparation-section-status preparing">เตรียมสินค้า</span></h2><p>เตรียมครบแล้ว กดปุ่ม “พร้อมส่ง” เพื่อยืนยัน</p></div><span className={`preparation-period-badge ${period}`}>{deliveryPeriods[period].label}</span></div>{batches.length ? <div className="preparation-batch-grid">{batches.map((batch, index) => { const items = getOrderItems(batch.orders); return <article key={batch.id} className="preparation-batch-card"><div className="preparation-batch-heading"><div><h3>รอบเตรียมสินค้า {index + 1}</h3><p>สินค้าสำหรับ {batch.orders.length} คน · สร้างเมื่อ {orderedAtLabel(batch.createdAt)}</p></div></div><div className="preparation-item-summary"><h4><PackageOpen size={18} aria-hidden="true" />ของที่ต้องเตรียม</h4><ul>{items.map((item) => <li key={item.name}><span>{item.name}</span><strong>{item.quantity} {item.unitName} {item.pieces > 0 && <small>· {item.pieces} ชิ้น</small>}</strong></li>)}</ul></div><details><summary>ดูของที่ลูกค้าแต่ละคนสั่ง <ChevronRight size={17} aria-hidden="true" /></summary><ul className="preparation-customer-list">{batch.orders.map((order) => <li key={order.id}><div className="preparation-customer-order-detail"><div className="preparation-customer-order-header"><strong className="preparation-customer-order-id">{order.orderNumber}</strong><strong>{order.userName}</strong><span>· {order.locationName}</span></div><p className="preparation-customer-order-items">{order.items.map((item) => <span key={item.name}>{item.name} {item.quantity} {item.unitName}</span>)}</p></div><button type="button" aria-label={`นำ ${order.userName} ออกจากรอบเตรียมสินค้า`} disabled={removeOrderMutation.isPending} onClick={() => removeOrderFromBatch(batch.id, order)}><X size={16} aria-hidden="true" />นำออก</button></li>)}</ul></details><button type="button" className="preparation-ready-button" disabled={markReadyMutation.isPending} onClick={() => markBatchReady(batch.id, batch.orders.length)}><Check size={18} aria-hidden="true" />เปลี่ยนสถานะ พร้อมส่ง</button></article> })}</div> : <p className="preparation-empty">{batchMessage}</p>}</section>

    {deliveryGroups.length > 0 && <section className="preparation-ready-history" aria-labelledby="preparation-ready-title">
      <div className="preparation-section-heading"><div><h2 id="preparation-ready-title"><Truck size={21} aria-hidden="true" />รอบจัดการสินค้า <span className="preparation-status preparation-section-status ready">พร้อมส่ง</span><span className="preparation-status preparation-section-status delivered">ส่งแล้ว</span></h2><p>เตรียมครบแล้ว กดปุ่ม “ส่งแล้ว” เพื่อยืนยัน</p></div><span className={`preparation-period-badge ${period}`}>{deliveryPeriods[period].label}</span></div>
      <div className="preparation-batch-grid">
        {deliveryGroups.map((group) => {
          const items = getOrderItems(group.orders)

          return <article key={group.locationId} className="preparation-batch-card preparation-ready-batch-card">
            <div className="preparation-batch-heading"><div><h3>จุดส่ง · {group.locationName}</h3><p>สินค้าสำหรับ {group.orders.length} คน</p></div></div>
            <div className="preparation-item-summary"><h4><PackageOpen size={18} aria-hidden="true" />ของที่เตรียมแล้ว</h4><ul>{items.map((item) => <li key={item.name}><span>{item.name}</span><strong>{item.quantity} {item.unitName}</strong></li>)}</ul></div>
            <details><summary>ดูของที่ลูกค้าแต่ละคนสั่ง <ChevronRight size={17} aria-hidden="true" /></summary><ul className="preparation-customer-list">{group.orders.map((order) => <li key={order.id}><div className="preparation-customer-order-detail"><div className="preparation-customer-order-header"><strong className="preparation-customer-order-id">{order.orderNumber}</strong><strong>{order.userName}</strong></div><p className="preparation-customer-order-items">{order.items.map((item) => <span key={item.name}>{item.name} {item.quantity} {item.unitName}</span>)}</p></div>{order.orderStatus === 'delivered' && <span className="preparation-delivery-check" role="img" aria-label="ส่งแล้ว"><CircleCheck size={28} aria-hidden="true" /></span>}</li>)}</ul></details>
            {group.orders.some((order) => order.orderStatus === 'ready_for_delivery') && <button type="button" className="preparation-delivered-button" disabled={markDeliveredMutation.isPending} onClick={() => markLocationDelivered(group.locationName, group.orders)}><Check size={18} aria-hidden="true" />เปลี่ยนสถานะ ส่งแล้ว</button>}
          </article>
        })}
      </div>
    </section>}
  </section>
}
