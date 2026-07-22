import { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip, type TooltipItem } from 'chart.js'
import { ArrowRight, Banknote, CalendarDays, CircleAlert, ClipboardList, Eye, MapPin, RefreshCw, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { deliveryPeriods, formatPrice, getOrderListStatus, getOrderTotal, mockOrders, statusClass, type DeliveryPeriod } from '@/features/admin/orders/order-data'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const dashboardDate = '2026-07-20'
const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const thaiMonthShortNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
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
          : `${context.parsed.y ?? 0} รายการสั่งซื้อ`,
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
  const [chartMetric, setChartMetric] = useState<'sales' | 'orders'>('sales')
  const [chartYear, setChartYear] = useState('2569')
  const [chartMonth, setChartMonth] = useState('6')
  const [chartLocation, setChartLocation] = useState('all')

  const locations = useMemo(() => Array.from(new Set(mockOrders.map((order) => order.location))), [])
  const periodSummary = period === 'all' ? 'รอบเช้าและรอบบ่าย' : deliveryPeriods[period].label
  const filteredOrders = useMemo(() => mockOrders.filter((order) => (
    order.deliveryDate === date
    && (period === 'all' || order.period === period)
    && (location === 'all' || order.location === location)
  )), [date, location, period])
  const paidOrders = filteredOrders.filter((order) => order.paymentStatus === 'จ่ายแล้ว')
  const activeOrders = filteredOrders.filter((order) => ['รอตรวจสอบ', 'เตรียมสินค้า', 'กำลังส่ง'].includes(order.status))
  const pendingOrders = filteredOrders
    .filter((order) => order.paymentStatus === 'รอชำระเงิน' || order.status === 'ยกเลิก')
    .slice(0, 5)
  const locationSummary = locations.map((item) => {
    const orders = filteredOrders.filter((order) => order.location === item)
    const morning = orders.filter((order) => order.period === 'morning').length
    const afternoon = orders.filter((order) => order.period === 'afternoon').length
    const paid = orders.filter((order) => order.paymentStatus === 'จ่ายแล้ว').length
    const active = orders.filter((order) => ['รอตรวจสอบ', 'เตรียมสินค้า', 'กำลังส่ง'].includes(order.status)).length
    return { location: item, morning, afternoon, paid, active, total: paid ? orders.filter((order) => order.paymentStatus === 'จ่ายแล้ว').reduce((sum, order) => sum + getOrderTotal(order), 0) : 0 }
  }).filter((item) => item.morning + item.afternoon > 0)
  const selectedMonthIndex = Number(chartMonth)
  const daysInSelectedMonth = new Date(Number(chartYear) - 543, selectedMonthIndex + 1, 0).getDate()
  const monthlyLabels = Array.from({ length: daysInSelectedMonth }, (_, index) => `${index + 1} ${thaiMonthShortNames[selectedMonthIndex]}`)
  const chartLocationOffset = chartLocation === 'all' ? 0 : locations.indexOf(chartLocation) + 1
  const monthlyValues = Array.from({ length: daysInSelectedMonth }, (_, index) => {
    const day = index + 1
    const variation = (day * 37 + selectedMonthIndex * 17 + Number(chartYear) + chartLocationOffset * 23) % 41
    return chartMetric === 'sales' ? 4200 + variation * 125 + (day % 6) * 290 - chartLocationOffset * 620 : 12 + variation % 17 + day % 5 - chartLocationOffset * 2
  })
  const monthlyChartData = {
    labels: monthlyLabels,
    datasets: [{
      data: monthlyValues,
      borderColor: chartMetric === 'sales' ? '#267053' : '#2f83d4',
      backgroundColor: chartMetric === 'sales' ? '#26705320' : '#2f83d420',
      fill: true,
      tension: .35,
      pointBackgroundColor: chartMetric === 'sales' ? '#267053' : '#2f83d4',
      pointRadius: 2.5,
      pointHoverRadius: 4,
    }],
  }

  function clearFilters() {
    setDate(dashboardDate)
    setPeriod('all')
    setLocation('all')
  }

  return <>
    <section className="dashboard-wide-chart"><article className="dashboard-chart-card"><div className="dashboard-card-heading"><div><h2>แนวโน้ม{chartMetric === 'sales' ? 'ยอดขาย' : 'จำนวนรายการสั่งซื้อ'} เดือน{thaiMonths[selectedMonthIndex]} {chartYear}</h2><p>แสดงข้อมูลรายวันทั้งหมด {daysInSelectedMonth} วัน{chartLocation !== 'all' ? ` · ${chartLocation}` : ''}</p></div><div className="dashboard-chart-controls"><div className="dashboard-chart-filter"><Select value={chartYear} onValueChange={setChartYear}><SelectTrigger aria-label="เลือกปีของกราฟ"><SelectValue /></SelectTrigger><SelectContent className="dashboard-chart-filter-content">{['2568', '2569', '2570'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={chartMonth} onValueChange={setChartMonth}><SelectTrigger aria-label="เลือกเดือนของกราฟ"><SelectValue /></SelectTrigger><SelectContent className="dashboard-chart-filter-content">{thaiMonths.map((item, index) => <SelectItem key={item} value={String(index)}>{item}</SelectItem>)}</SelectContent></Select><Select value={chartLocation} onValueChange={setChartLocation}><SelectTrigger aria-label="เลือกจุดรับสินค้าของกราฟ"><SelectValue /></SelectTrigger><SelectContent className="dashboard-chart-filter-content"><SelectItem value="all">ทุกจุดรับ</SelectItem>{locations.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="dashboard-chart-toggle" role="group" aria-label="เลือกข้อมูลกราฟ"><button type="button" className={chartMetric === 'sales' ? 'active' : ''} onClick={() => setChartMetric('sales')}>ยอดขาย</button><button type="button" className={chartMetric === 'orders' ? 'active' : ''} onClick={() => setChartMetric('orders')}>รายการสั่งซื้อ</button></div></div></div><div className="dashboard-chart"><Line data={monthlyChartData} options={chartOptions(chartMetric)} aria-label={chartMetric === 'sales' ? `กราฟยอดขายเดือน${thaiMonths[selectedMonthIndex]} ${chartYear}` : `กราฟจำนวนรายการสั่งซื้อเดือน${thaiMonths[selectedMonthIndex]} ${chartYear}`} role="img" /></div></article></section>

    <section className="dashboard-dispatch-controls" aria-label="ตัวกรองสรุปรอบส่งและรายการสั่งซื้อที่ต้องติดตาม"><div className="dashboard-filter-card"><div className="dashboard-filter-groups"><div className="dashboard-filter-group"><p><CalendarDays size={16} aria-hidden="true" />กำหนดรอบส่ง</p><label>วันจัดส่ง<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>รอบส่ง<Select value={period} onValueChange={(value) => setPeriod(value as 'all' | DeliveryPeriod)}><SelectTrigger aria-label="รอบส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem><SelectItem value="morning">รอบเช้า</SelectItem><SelectItem value="afternoon">รอบบ่าย</SelectItem></SelectContent></Select></label></div><div className="dashboard-filter-group"><p><MapPin size={16} aria-hidden="true" />จุดรับสินค้า</p><label>สถานที่รับสินค้า<Select value={location} onValueChange={setLocation}><SelectTrigger aria-label="จุดรับสินค้า"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem>{locations.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label></div></div><button type="button" className="dashboard-reset-button" onClick={clearFilters}><RefreshCw size={16} aria-hidden="true" />ล้างตัวกรอง</button></div></section>

    <div className="admin-cards dashboard-kpis">
      <Link to="/admin/orders" className="dashboard-kpi"><span className="admin-card-icon mint"><Banknote size={22} aria-hidden="true" /></span><span><small>ยอดขายที่ชำระแล้ว</small><strong>{formatPrice(paidOrders.reduce((sum, order) => sum + getOrderTotal(order), 0))}</strong><p>มี {paidOrders.length} รายการ <ArrowRight size={14} aria-hidden="true" /></p></span></Link>
      <Link to="/admin/orders" className="dashboard-kpi"><span className="admin-card-icon peach"><ClipboardList size={22} aria-hidden="true" /></span><span><small>แสดงรายการ</small><strong>{filteredOrders.length} รายการ</strong><p>ดูรายการทั้งหมด <ArrowRight size={14} aria-hidden="true" /></p></span></Link>
      <Link to="/admin/dispatches-today" className="dashboard-kpi"><span className="admin-card-icon blue"><Truck size={22} aria-hidden="true" /></span><span><small>รอดำเนินการ</small><strong>{activeOrders.length} รายการ</strong><p className={activeOrders.length ? 'warning' : 'positive'}>{activeOrders.length ? <>ดูรายการ <ArrowRight size={14} aria-hidden="true" /></> : 'ไม่มีงานค้าง'}</p></span></Link>
      <a href="#dashboard-pending-orders" className="dashboard-kpi"><span className="admin-card-icon rose"><CircleAlert size={22} aria-hidden="true" /></span><span><small>รอชำระเงินและยกเลิก</small><strong>{pendingOrders.length} รายการ</strong><p>ดูรายการ <ArrowRight size={14} aria-hidden="true" /></p></span></a>
    </div>

    <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>สรุปรอบส่งแยกตามจุดรับสินค้า</h2><p>ใช้ตรวจจำนวนงานและยอดขายก่อนเตรียมของ</p></div><Link to="/admin/dispatches-today" className="admin-text-button">ดูรอบส่ง</Link></div><div className="dashboard-table-scroll"><table className="dashboard-data-table"><thead><tr><th>จุดรับสินค้า</th><th>รอบเช้า</th><th>รอบบ่าย</th><th>จ่ายแล้ว</th><th>รอดำเนินการ</th><th>ยอดขาย</th><th><span className="sr-only">ดูรอบส่ง</span></th></tr></thead><tbody>{locationSummary.length ? locationSummary.map((item) => <tr key={item.location}><td><strong>{item.location}</strong></td><td className="numeric">{item.morning}</td><td className="numeric">{item.afternoon}</td><td className="numeric">{item.paid}</td><td className="numeric">{item.active}</td><td className="numeric"><strong>{formatPrice(item.total)}</strong></td><td><Link className="admin-table-link" to="/admin/dispatches-today" aria-label={`ดูรอบส่ง ${item.location}`}><Eye size={18} aria-hidden="true" /></Link></td></tr>) : <tr><td colSpan={7} className="dashboard-empty-cell">ไม่มีรายการสั่งซื้อในตัวกรองนี้</td></tr>}</tbody></table></div></section>

    <section id="dashboard-pending-orders" className="dashboard-bottom-grid dashboard-orders-only">
      <article className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>รายการสั่งซื้อ (รอการชำระเงิน, ยกเลิก)</h2><p>แสดงรายการสั่งซื้อที่รอชำระเงินหรือยกเลิก</p></div><Link to="/admin/orders" className="admin-text-button">ดูรายการสั่งซื้อ</Link></div><div className="dashboard-table-scroll"><table className="dashboard-data-table dashboard-order-table"><thead><tr><th>เลขที่รายการสั่งซื้อ</th><th>ลูกค้า / จุดรับ</th><th>รอบส่ง</th><th>ยอดรวม</th><th>สถานะ</th><th>ดูรายการ</th></tr></thead><tbody>{pendingOrders.length ? pendingOrders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td><strong>{order.customerName}</strong><small>{order.location}</small></td><td><strong>{deliveryPeriods[order.period].label}</strong></td><td className="numeric">{formatPrice(getOrderTotal(order))}</td><td><span className={`admin-status ${statusClass(getOrderListStatus(order))}`}>{getOrderListStatus(order)}</span></td><td><Link className="admin-table-link" to={`/admin/orders/${order.id}`} aria-label={`ดูรายละเอียดรายการสั่งซื้อ ${order.id}`}><Eye size={18} aria-hidden="true" /></Link></td></tr>) : <tr><td colSpan={6} className="dashboard-empty-cell">ไม่มีรายการสั่งซื้อที่รอชำระเงินหรือยกเลิก</td></tr>}</tbody></table></div></article>
    </section>
    <p className="dashboard-filter-summary dashboard-filter-summary-bottom"><CalendarDays size={18} aria-hidden="true" />ข้อมูลสำหรับวันที่ {formatDashboardDate(date)} ({periodSummary}){location !== 'all' ? ` · ${location}` : ''}</p>
  </>
}
