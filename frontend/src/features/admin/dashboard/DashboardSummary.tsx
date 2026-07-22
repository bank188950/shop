import { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip, type TooltipItem } from 'chart.js'
import { ArrowRight, CalendarDays, CircleAlert, ClipboardCheck, ClipboardList, Eye, MapPin, PackageSearch, RefreshCw, Truck, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminProducts } from '@/features/admin/product/admin-products'
import { deliveryPeriods, formatPrice, getOrderListStatus, getOrderTotal, mockOrders, statusClass, type DeliveryPeriod, type OrderListStatus } from '@/features/admin/orders/order-data'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const dashboardDate = '2026-07-20'
const statusFilters = ['ทั้งหมด', 'รอชำระเงิน', 'รอตรวจสอบ', 'เตรียมสินค้า', 'กำลังส่ง'] as const

const chartOptions = (metric: 'sales' | 'orders') => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      displayColors: false,
      backgroundColor: '#183326',
      padding: 10,
      callbacks: {
        label: (context: TooltipItem<'line'>) => metric === 'sales'
          ? formatPrice(context.parsed.y ?? 0)
          : `${context.parsed.y ?? 0} ออเดอร์`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#65716a', font: { family: 'Sarabun' } } },
    y: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: '#e3e8e4' },
      ticks: {
        color: '#65716a',
        font: { family: 'Sarabun' },
        callback: (value: string | number) => metric === 'sales' ? `${Number(value).toLocaleString('th-TH')}` : value,
      },
    },
  },
})

function formatDashboardDate(value: string) {
  if (value === dashboardDate) return '20 กรกฎาคม 2569'
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

export function DashboardSummary() {
  const [date, setDate] = useState(dashboardDate)
  const [period, setPeriod] = useState<'all' | DeliveryPeriod>('all')
  const [location, setLocation] = useState('all')
  const [orderStatus, setOrderStatus] = useState<(typeof statusFilters)[number]>('ทั้งหมด')
  const [chartMetric, setChartMetric] = useState<'sales' | 'orders'>('sales')

  const locations = useMemo(() => Array.from(new Set(mockOrders.map((order) => order.location))), [])
  const todayOrders = useMemo(() => mockOrders.filter((order) => order.deliveryDate === dashboardDate), [])
  const filteredOrders = useMemo(() => todayOrders.filter((order) => (
    order.deliveryDate === date
    && (period === 'all' || order.period === period)
    && (location === 'all' || order.location === location)
  )), [date, location, period, todayOrders])
  const paidOrders = todayOrders.filter((order) => order.paymentStatus === 'จ่ายแล้ว')
  const activeOrders = todayOrders.filter((order) => ['รอตรวจสอบ', 'เตรียมสินค้า', 'กำลังส่ง'].includes(order.status))
  const lowStockProducts = adminProducts.filter((product) => product.status === 'สต็อกต่ำ')
  const requiredOrders = filteredOrders
    .filter((order) => !['ส่งแล้ว', 'ยกเลิก'].includes(order.status))
    .filter((order) => orderStatus === 'ทั้งหมด' || getOrderListStatus(order) === orderStatus)
    .slice(0, 6)
  const locationSummary = locations.map((item) => {
    const orders = filteredOrders.filter((order) => order.location === item)
    const morning = orders.filter((order) => order.period === 'morning').length
    const afternoon = orders.filter((order) => order.period === 'afternoon').length
    const paid = orders.filter((order) => order.paymentStatus === 'จ่ายแล้ว').length
    const active = orders.filter((order) => ['รอตรวจสอบ', 'เตรียมสินค้า', 'กำลังส่ง'].includes(order.status)).length
    return { location: item, morning, afternoon, paid, active, total: paid ? orders.filter((order) => order.paymentStatus === 'จ่ายแล้ว').reduce((sum, order) => sum + getOrderTotal(order), 0) : 0 }
  }).filter((item) => item.morning + item.afternoon > 0)
  const pendingPayment = todayOrders.filter((order) => order.paymentStatus === 'รอชำระเงิน' && order.status !== 'ยกเลิก').length
  const preparing = todayOrders.filter((order) => ['รอตรวจสอบ', 'เตรียมสินค้า'].includes(order.status)).length
  const delivering = todayOrders.filter((order) => order.status === 'กำลังส่ง').length
  const weeklyChartData = chartMetric === 'sales'
    ? { labels: ['14 ก.ค.', '15 ก.ค.', '16 ก.ค.', '17 ก.ค.', '18 ก.ค.', '19 ก.ค.', '20 ก.ค.'], datasets: [{ data: [6240, 7180, 6490, 7920, 8640, 9130, 7860], borderColor: '#267053', backgroundColor: '#26705320', fill: true, tension: .35, pointBackgroundColor: '#267053', pointRadius: 3 }] }
    : { labels: ['14 ก.ค.', '15 ก.ค.', '16 ก.ค.', '17 ก.ค.', '18 ก.ค.', '19 ก.ค.', '20 ก.ค.'], datasets: [{ data: [18, 22, 19, 25, 27, 31, 24], borderColor: '#2f83d4', backgroundColor: '#2f83d420', fill: true, tension: .35, pointBackgroundColor: '#2f83d4', pointRadius: 3 }] }

  function clearFilters() {
    setDate(dashboardDate)
    setPeriod('all')
    setLocation('all')
  }

  return <>
    <div className="admin-cards dashboard-kpis">
      <Link to="/admin/orders" className="dashboard-kpi"><span className="admin-card-icon mint"><WalletCards size={22} aria-hidden="true" /></span><span><small>ยอดขายที่ชำระแล้ว</small><strong>{formatPrice(paidOrders.reduce((sum, order) => sum + getOrderTotal(order), 0))}</strong><p>จาก {paidOrders.length} ออเดอร์ <ArrowRight size={14} aria-hidden="true" /></p></span></Link>
      <Link to="/admin/orders" className="dashboard-kpi"><span className="admin-card-icon peach"><ClipboardList size={22} aria-hidden="true" /></span><span><small>ออเดอร์วันนี้</small><strong>{todayOrders.length} รายการ</strong><p>ดูรายการทั้งหมด <ArrowRight size={14} aria-hidden="true" /></p></span></Link>
      <Link to="/admin/dispatches-today" className="dashboard-kpi"><span className="admin-card-icon blue"><Truck size={22} aria-hidden="true" /></span><span><small>รอดำเนินการ</small><strong>{activeOrders.length} รายการ</strong><p className={activeOrders.length ? 'warning' : 'positive'}>{activeOrders.length ? 'เตรียมและส่งสินค้า' : 'ไม่มีงานค้าง'}</p></span></Link>
      <Link to="/admin/products" className="dashboard-kpi"><span className="admin-card-icon rose"><CircleAlert size={22} aria-hidden="true" /></span><span><small>สต็อกใกล้หมด</small><strong>{lowStockProducts.length} รายการ</strong><p className={lowStockProducts.length ? 'warning' : 'positive'}>{lowStockProducts.length ? 'ต้องตรวจสอบ' : 'สต็อกพร้อมขาย'}</p></span></Link>
    </div>

    <section className="dashboard-work-grid">
      <article className="dashboard-chart-card"><div className="dashboard-card-heading"><div><h2>แนวโน้มย้อนหลัง 7 วัน</h2><p>{chartMetric === 'sales' ? 'ยอดขายที่ชำระแล้วในแต่ละวัน' : 'จำนวนออเดอร์ในแต่ละวัน'}</p></div><div className="dashboard-chart-toggle" role="group" aria-label="เลือกข้อมูลกราฟ"><button type="button" className={chartMetric === 'sales' ? 'active' : ''} onClick={() => setChartMetric('sales')}>ยอดขาย</button><button type="button" className={chartMetric === 'orders' ? 'active' : ''} onClick={() => setChartMetric('orders')}>ออเดอร์</button></div></div><div className="dashboard-chart"><Line data={weeklyChartData} options={chartOptions(chartMetric)} aria-label={chartMetric === 'sales' ? 'กราฟยอดขายย้อนหลัง 7 วัน' : 'กราฟจำนวนออเดอร์ย้อนหลัง 7 วัน'} role="img" /></div></article>
      <article className="dashboard-panel dashboard-action-panel"><div className="dashboard-panel-heading"><div><h2>งานที่ต้องดำเนินการ</h2><p>เรียงตามงานที่ต้องตรวจสอบในรอบนี้</p></div><Link to="/admin/orders" className="admin-text-button">ดูทั้งหมด</Link></div><div className="admin-task-list">{pendingPayment > 0 && <article><span className="admin-task-icon orange"><WalletCards size={20} aria-hidden="true" /></span><div><strong>รอตรวจสอบการชำระเงิน {pendingPayment} ออเดอร์</strong><p>ตรวจหลักฐานก่อนเริ่มเตรียมสินค้า</p></div><Link className="admin-secondary-button" to="/admin/orders">ตรวจสอบ</Link></article>}{preparing > 0 && <article><span className="admin-task-icon blue"><ClipboardCheck size={20} aria-hidden="true" /></span><div><strong>มี {preparing} ออเดอร์ที่ต้องเตรียมสินค้า</strong><p>จัดของให้พร้อมตามจุดรับและรอบส่ง</p></div><Link className="admin-secondary-button" to="/admin/dispatches-today">ดูรอบส่ง</Link></article>}{delivering > 0 && <article><span className="admin-task-icon mint"><Truck size={20} aria-hidden="true" /></span><div><strong>กำลังส่ง {delivering} ออเดอร์</strong><p>ติดตามการส่งมอบให้เสร็จสิ้น</p></div><Link className="admin-secondary-button" to="/admin/dispatches-today">ติดตาม</Link></article>}{lowStockProducts.length > 0 && <article><span className="admin-task-icon orange"><PackageSearch size={20} aria-hidden="true" /></span><div><strong>สต็อกต่ำ {lowStockProducts.length} รายการ</strong><p>เติมสินค้าเพื่อไม่ให้การขายสะดุด</p></div><Link className="admin-secondary-button" to="/admin/products">ตรวจสอบ</Link></article>}{!pendingPayment && !preparing && !delivering && !lowStockProducts.length && <p className="dashboard-empty-state">ไม่มีงานเร่งด่วนวันนี้</p>}</div></article>
    </section>

    <section className="dashboard-dispatch-controls" aria-label="ตัวกรองสรุปรอบส่งและออเดอร์ที่ต้องติดตาม"><div className="dashboard-filter-card"><div className="dashboard-filter-groups"><div className="dashboard-filter-group"><p><CalendarDays size={16} aria-hidden="true" />กำหนดรอบส่ง</p><label>วันจัดส่ง<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>รอบส่ง<Select value={period} onValueChange={(value) => setPeriod(value as 'all' | DeliveryPeriod)}><SelectTrigger aria-label="รอบส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem><SelectItem value="morning">รอบเช้า</SelectItem><SelectItem value="afternoon">รอบบ่าย</SelectItem></SelectContent></Select></label></div><div className="dashboard-filter-group"><p><MapPin size={16} aria-hidden="true" />จุดรับสินค้า</p><label>สถานที่รับสินค้า<Select value={location} onValueChange={setLocation}><SelectTrigger aria-label="จุดรับสินค้า"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem>{locations.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label></div></div><button type="button" className="dashboard-reset-button" onClick={clearFilters}><RefreshCw size={16} aria-hidden="true" />ล้างตัวกรอง</button></div><p className="dashboard-filter-summary">กำลังแสดงข้อมูลสำหรับวันที่ {formatDashboardDate(date)}{period !== 'all' ? ` · ${deliveryPeriods[period].label}` : ''}{location !== 'all' ? ` · ${location}` : ''}</p></section>

    <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>สรุปรอบส่งแยกตามจุดรับสินค้า</h2><p>ใช้ตรวจจำนวนงานและยอดขายก่อนเตรียมของ</p></div><Link to="/admin/dispatches-today" className="admin-text-button">ดูรอบส่งวันนี้</Link></div><div className="dashboard-table-scroll"><table className="dashboard-data-table"><thead><tr><th>จุดรับสินค้า</th><th>รอบเช้า</th><th>รอบบ่าย</th><th>จ่ายแล้ว</th><th>รอดำเนินการ</th><th>ยอดขาย</th><th><span className="sr-only">ดูรอบส่ง</span></th></tr></thead><tbody>{locationSummary.length ? locationSummary.map((item) => <tr key={item.location}><td><strong>{item.location}</strong></td><td className="numeric">{item.morning}</td><td className="numeric">{item.afternoon}</td><td className="numeric">{item.paid}</td><td className="numeric">{item.active}</td><td className="numeric"><strong>{formatPrice(item.total)}</strong></td><td><Link className="admin-table-link" to="/admin/dispatches-today" aria-label={`ดูรอบส่ง ${item.location}`}><Eye size={18} aria-hidden="true" /></Link></td></tr>) : <tr><td colSpan={7} className="dashboard-empty-cell">ไม่มีออเดอร์ในตัวกรองนี้</td></tr>}</tbody></table></div></section>

    <section className="dashboard-bottom-grid">
      <article className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>ออเดอร์ที่ต้องติดตาม</h2><p>แสดงเฉพาะออเดอร์ที่ยังไม่เสร็จสิ้น</p></div><div className="dashboard-inline-filter"><Select value={orderStatus} onValueChange={(value) => setOrderStatus(value as (typeof statusFilters)[number])}><SelectTrigger aria-label="กรองสถานะออเดอร์"><SelectValue /></SelectTrigger><SelectContent>{statusFilters.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Link to="/admin/orders" className="admin-text-button">ดูทั้งหมด</Link></div></div><div className="dashboard-table-scroll"><table className="dashboard-data-table dashboard-order-table"><thead><tr><th>เลขออเดอร์</th><th>ลูกค้า / จุดรับ</th><th>รอบส่ง</th><th>ยอดรวม</th><th>ชำระเงิน</th><th>สถานะงาน</th><th><span className="sr-only">ดูรายละเอียด</span></th></tr></thead><tbody>{requiredOrders.length ? requiredOrders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td><strong>{order.customerName}</strong><small>{order.location}</small></td><td><strong>{deliveryPeriods[order.period].label}</strong></td><td className="numeric">{formatPrice(getOrderTotal(order))}</td><td><span className={`admin-status ${statusClass(order.paymentStatus)}`}>{order.paymentStatus}</span></td><td><span className={`admin-status ${statusClass(getOrderListStatus(order))}`}>{getOrderListStatus(order)}</span></td><td><Link className="admin-table-link" to={`/admin/orders/${order.id}`} aria-label={`ดูรายละเอียดออเดอร์ ${order.id}`}><Eye size={18} aria-hidden="true" /></Link></td></tr>) : <tr><td colSpan={7} className="dashboard-empty-cell">ไม่มีออเดอร์ที่ต้องติดตาม</td></tr>}</tbody></table></div></article>
      <article className="dashboard-panel dashboard-stock-panel"><div className="dashboard-panel-heading"><div><h2>สินค้าสต็อกต่ำ</h2><p>ตรวจและเติมสินค้าให้ทันรอบถัดไป</p></div><Link to="/admin/products" className="admin-text-button">ดูสินค้า</Link></div><div className="dashboard-table-scroll"><table className="dashboard-data-table dashboard-stock-table"><thead><tr><th>สินค้า</th><th>คงเหลือ</th><th>จุดแจ้งเตือน</th><th>สถานะ</th></tr></thead><tbody>{lowStockProducts.length ? lowStockProducts.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><small>{product.category}</small></td><td className="numeric">{product.stock}</td><td className="numeric">{product.lowStockThreshold} ชิ้น</td><td><span className="admin-status low">สต็อกต่ำ</span></td></tr>) : <tr><td colSpan={4} className="dashboard-empty-cell">ไม่มีสินค้าที่ต้องเติม</td></tr>}</tbody></table></div></article>
    </section>
  </>
}
