import { Eye, ListChecks, Repeat2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Swal from 'sweetalert2'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'
import { deliveryPeriods, formatPrice, getOrderListStatus, getOrderTotal, mockOrders, orderListStatuses, statusClass, type AdminOrder, type DeliveryPeriod, type OrderListStatus, type OrderStatus } from '@/features/admin/orders/order-data'

const bulkStatusOptions = orderListStatuses.filter((item) => item !== 'รอชำระเงิน')

function BulkStatusSelect({ onValueChange }: { onValueChange: (value: string) => void }) {
  return <Select onValueChange={onValueChange}><SelectTrigger className="min-h-12 text-base" aria-label="เลือกสถานะใหม่"><SelectValue placeholder="เลือกสถานะ" /></SelectTrigger><SelectContent className="z-[1100]">{bulkStatusOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
}

export function OrderPage() {
  const [ordersData, setOrdersData] = useState<AdminOrder[]>(mockOrders)
  const [date, setDate] = useState('2026-07-20')
  const [period, setPeriod] = useState<'all' | DeliveryPeriod>('all')
  const [location, setLocation] = useState('all')
  const [status, setStatus] = useState<'all' | OrderListStatus>('all')
  const [query, setQuery] = useState('')
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const selectAllRef = useRef<HTMLInputElement>(null)
  const locations = [...new Set(ordersData.map((order) => order.location))]
  const orders = useMemo(() => ordersData.filter((order) => (
    order.deliveryDate === date
    && (period === 'all' || order.period === period)
    && (location === 'all' || order.location === location)
    && (status === 'all' || getOrderListStatus(order) === status)
    && `${order.id} ${order.customerName}`.toLowerCase().includes(query.toLowerCase())
  )), [date, location, ordersData, period, query, status])
  const changeableOrders = orders.filter((order) => order.paymentStatus !== 'รอชำระเงิน')
  const selectedChangeableOrderIds = selectedOrderIds.filter((id) => changeableOrders.some((order) => order.id === id))
  const allChangeableSelected = changeableOrders.length > 0 && changeableOrders.every((order) => selectedOrderIds.includes(order.id))
  const hasPartialSelection = selectedChangeableOrderIds.length > 0 && !allChangeableSelected
  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize))
  const visibleOrders = orders.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = hasPartialSelection
  }, [hasPartialSelection])

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount))
  }, [pageCount])

  function toggleOrder(order: AdminOrder) {
    if (order.paymentStatus === 'รอชำระเงิน') return
    setSelectedOrderIds((current) => current.includes(order.id) ? current.filter((id) => id !== order.id) : [...current, order.id])
  }

  function toggleAllChangeableOrders() {
    const changeableIds = changeableOrders.map((order) => order.id)
    setSelectedOrderIds((current) => allChangeableSelected ? current.filter((id) => !changeableIds.includes(id)) : [...new Set([...current, ...changeableIds])])
  }

  async function updateSelectedStatuses() {
    if (!selectedChangeableOrderIds.length) return
    let selectedStatus = ''
    let selectRoot: Root | undefined
    const result = await Swal.fire({
      title: 'เปลี่ยนสถานะรายการสั่งซื้อ',
      text: `เลือกสถานะใหม่สำหรับ ${selectedChangeableOrderIds.length} รายการสั่งซื้อ`,
      html: '<div id="bulk-status-select"></div>',
      showCancelButton: true,
      confirmButtonText: 'เปลี่ยนสถานะ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#7b393e',
      cancelButtonColor: '#607168',
      reverseButtons: true,
      focusCancel: true,
      didOpen: () => {
        const container = Swal.getHtmlContainer()?.querySelector('#bulk-status-select')
        if (!container) return
        selectRoot = createRoot(container)
        selectRoot.render(<BulkStatusSelect onValueChange={(value) => { selectedStatus = value; Swal.resetValidationMessage() }} />)
      },
      willClose: () => selectRoot?.unmount(),
      preConfirm: () => {
        if (!selectedStatus) Swal.showValidationMessage('กรุณาเลือกสถานะใหม่')
        return selectedStatus
      },
    })
    if (!result.value) return

    setOrdersData((current) => current.map((order) => selectedChangeableOrderIds.includes(order.id) ? { ...order, status: result.value as OrderStatus } : order))
    setSelectedOrderIds((current) => current.filter((id) => !selectedChangeableOrderIds.includes(id)))
  }

  return <section className="admin-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">รายการสั่งซื้อ</h1></div><Link to="/admin/dispatches-today" className="admin-secondary-button"><Repeat2 size={18} aria-hidden="true" />ดูสรุปรอบส่งวันนี้</Link></div>
    <section className="admin-filter-card" aria-label="ตัวกรองรายการสั่งซื้อ">
      <label className="admin-filter-date">วันจัดส่ง<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label className="admin-search"><Search size={18} aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อลูกค้า หรือเลขที่รายการสั่งซื้อ" /></label>
      <label className="admin-filter-select">รอบส่ง<Select value={period} onValueChange={(value) => setPeriod(value as 'all' | DeliveryPeriod)}><SelectTrigger aria-label="รอบส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem><SelectItem value="morning">รอบเช้า</SelectItem><SelectItem value="afternoon">รอบบ่าย</SelectItem></SelectContent></Select></label>
      <label className="admin-filter-select">จุดนัด<Select value={location} onValueChange={setLocation}><SelectTrigger aria-label="จุดนัด"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem>{locations.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
      <label className="admin-filter-select">สถานะ<Select value={status} onValueChange={(value) => setStatus(value as 'all' | OrderListStatus)}><SelectTrigger aria-label="สถานะ"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem>{orderListStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
    </section>
    <div className="admin-bulk-actions" aria-live="polite"><p>{selectedChangeableOrderIds.length ? `เลือกแล้ว ${selectedChangeableOrderIds.length} รายการสั่งซื้อ` : 'เลือกรายการสั่งซื้อที่ชำระเงินแล้วเพื่อเปลี่ยนสถานะ'}</p><button className="admin-primary-button" type="button" onClick={updateSelectedStatuses} disabled={!selectedChangeableOrderIds.length}><ListChecks size={18} aria-hidden="true" />เปลี่ยนสถานะ</button></div>
    <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th className="admin-order-select"><input ref={selectAllRef} type="checkbox" checked={allChangeableSelected} onChange={toggleAllChangeableOrders} disabled={!changeableOrders.length} aria-label="เลือกรายการสั่งซื้อที่ชำระเงินแล้วทั้งหมด" title="เลือกเฉพาะรายการสั่งซื้อที่ชำระเงินแล้ว" /></th><th>เลขที่รายการสั่งซื้อ</th><th>ลูกค้า / จุดรับ</th><th>รอบส่ง</th><th>รายการ</th><th>ยอดรวม</th><th>ชำระเงิน</th><th>สถานะ</th><th><span className="sr-only">ดูรายละเอียด</span></th></tr></thead><tbody>{orders.length ? visibleOrders.map((order) => { const isPendingPayment = order.paymentStatus === 'รอชำระเงิน'; return <tr key={order.id}><td className="admin-order-select"><input type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={() => toggleOrder(order)} disabled={isPendingPayment} aria-label={isPendingPayment ? `ไม่สามารถเปลี่ยนสถานะรายการสั่งซื้อ ${order.id} เพราะรอชำระเงิน` : `เลือกรายการสั่งซื้อ ${order.id}`} title={isPendingPayment ? 'รายการสั่งซื้อรอชำระเงินไม่สามารถเปลี่ยนสถานะได้' : 'เลือกรายการสั่งซื้อ'} /></td><td><strong>{order.id}</strong><small>{order.orderedAt}</small></td><td><strong>{order.customerName}</strong><small>{order.location}</small></td><td><strong>{deliveryPeriods[order.period].label}</strong><small>{deliveryPeriods[order.period].deliveryTime}</small></td><td>{order.items.map((item) => <small key={item.name}>{item.name} {item.quantity} {item.unit}</small>)}</td><td className="numeric"><strong>{formatPrice(getOrderTotal(order))}</strong></td><td><span className={`admin-status ${statusClass(order.paymentStatus)}`}>{order.paymentStatus}</span></td><td><span className={`admin-status ${statusClass(getOrderListStatus(order))}`}>{getOrderListStatus(order)}</span></td><td><Link className="admin-table-link" to={`/admin/orders/${order.id}`} aria-label={`ดูรายละเอียดรายการสั่งซื้อ ${order.id}`}><Eye size={19} aria-hidden="true" /></Link></td></tr> }) : <tr><td className="admin-empty-cell" colSpan={9}>ไม่พบรายการสั่งซื้อที่ตรงกับตัวกรอง</td></tr>}</tbody></table></div><AdminTablePagination currentPage={page} totalItems={orders.length} pageSize={pageSize} onPageChange={setPage} label="รายการสั่งซื้อ" /></div>
  </section>
}
