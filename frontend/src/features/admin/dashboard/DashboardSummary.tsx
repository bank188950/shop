import { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip, type TooltipItem } from 'chart.js'
import { ArrowRight, Banknote, CalendarDays, CircleAlert, ClipboardList, Eye, MapPin, RefreshCw, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThaiDatePicker } from '@/components/ui/thai-date-picker'
import { deliveryPeriods, formatPrice, orderStatusClass, orderStatusLabel, todayIsoDate } from '@/features/admin/orders/utils/order-labels'
import { useDashboardChart, useDashboardSummary } from '@/features/admin/dashboard/hooks/useDashboard'
import type { AdminDeliveryPeriod } from '@/api/admin/orders'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const chartRangeOptions = [{ value: 'today', label: 'วันนี้' }, { value: 'week', label: 'สัปดาห์นี้' }, { value: 'month', label: 'เดือนนี้' }] as const
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

/** แปลง `YYYY-MM-DD` เป็นวันที่ไทยแบบเต็มโดยไม่ผ่าน Date เพื่อไม่ให้ timezone เลื่อนวัน */
function formatDashboardDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return `${day} ${thaiMonths[month - 1]} ${year + 543}`
}

const currentYear = new Date().getFullYear()
const chartYearOptions = [currentYear - 1, currentYear, currentYear + 1].map((year) => String(year + 543))

export function DashboardSummary() {
  const [date, setDate] = useState(todayIsoDate)
  const [period, setPeriod] = useState<'all' | AdminDeliveryPeriod>('all')
  const [locationId, setLocationId] = useState<'all' | number>('all')
  const [chartMetric, setChartMetric] = useState<'sales' | 'orders'>('sales')
  const [chartYear, setChartYear] = useState(String(currentYear + 543))
  const [chartMonthIndex, setChartMonthIndex] = useState(String(new Date().getMonth()))
  const [chartLocationId, setChartLocationId] = useState<'all' | number>('all')
  const [chartRange, setChartRange] = useState<'today' | 'week' | 'month'>('month')

  const filters = useMemo(() => ({ deliveryDate: date, deliveryPeriod: period, locationId }), [date, locationId, period])
  const chartFilters = useMemo(() => ({
    metric: chartMetric,
    range: chartRange,
    year: Number(chartYear) - 543,
    month: Number(chartMonthIndex) + 1,
    locationId: chartLocationId,
  }), [chartLocationId, chartMetric, chartMonthIndex, chartRange, chartYear])

  const summaryQuery = useDashboardSummary(filters)
  const chartQuery = useDashboardChart(chartFilters)
  const summary = summaryQuery.data?.summary
  const locations = summaryQuery.data?.locations ?? []
  const locationSummary = summary?.locationSummary ?? []
  const pendingOrders = summary?.pendingOrders ?? []
  const periodSummary = period === 'all' ? 'รอบเช้าและรอบบ่าย' : deliveryPeriods[period].label
  const locationName = locations.find((item) => item.id === locationId)?.name ?? ''
  const activeOrderCount = summary?.activeOrderCount ?? 0

  const selectedMonthIndex = Number(chartMonthIndex)
  const chartRangeTitle = chartRange === 'today' ? 'วันนี้' : chartRange === 'week' ? 'สัปดาห์นี้' : `เดือน${thaiMonths[selectedMonthIndex]} ${chartYear}`
  const chartData = {
    labels: chartQuery.data?.labels ?? [],
    datasets: [{
      data: chartQuery.data?.values ?? [],
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
    setDate(todayIsoDate())
    setPeriod('all')
    setLocationId('all')
  }

  if (summaryQuery.isLoading) return <div className="page-message">กำลังโหลดข้อมูลภาพรวม...</div>
  if (summaryQuery.isError) return <div className="page-message">ไม่สามารถโหลดข้อมูลภาพรวมได้: {summaryQuery.error.message}</div>

  return <>
    <section className="dashboard-wide-chart"><article className="dashboard-chart-card"><div className="dashboard-card-heading"><div><h2>แนวโน้ม{chartMetric === 'sales' ? 'ยอดขาย' : 'จำนวนรายการสั่งซื้อ'} {chartRangeTitle}</h2><div className="dashboard-chart-range" role="group" aria-label="เลือกช่วงเวลาของกราฟ">{chartRangeOptions.map((option) => <button key={option.value} type="button" className={chartRange === option.value ? 'active' : ''} aria-pressed={chartRange === option.value} onClick={() => setChartRange(option.value)}>{option.label}</button>)}</div></div><div className="dashboard-chart-controls"><div className="dashboard-chart-filter"><Select value={chartYear} onValueChange={(value) => { setChartYear(value); setChartRange('month') }}><SelectTrigger aria-label="เลือกปีของกราฟ"><SelectValue /></SelectTrigger><SelectContent className="dashboard-chart-filter-content">{chartYearOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={chartMonthIndex} onValueChange={(value) => { setChartMonthIndex(value); setChartRange('month') }}><SelectTrigger aria-label="เลือกเดือนของกราฟ"><SelectValue /></SelectTrigger><SelectContent className="dashboard-chart-filter-content">{thaiMonths.map((item, index) => <SelectItem key={item} value={String(index)}>{item}</SelectItem>)}</SelectContent></Select><Select value={String(chartLocationId)} onValueChange={(value) => setChartLocationId(value === 'all' ? 'all' : Number(value))}><SelectTrigger aria-label="เลือกจุดรับสินค้าของกราฟ"><SelectValue /></SelectTrigger><SelectContent className="dashboard-chart-filter-content"><SelectItem value="all">ทุกจุดรับ</SelectItem>{locations.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></div><div className="dashboard-chart-toggle" role="group" aria-label="เลือกข้อมูลกราฟ"><button type="button" className={chartMetric === 'sales' ? 'active' : ''} onClick={() => setChartMetric('sales')}>ยอดขาย</button><button type="button" className={chartMetric === 'orders' ? 'active' : ''} onClick={() => setChartMetric('orders')}>รายการสั่งซื้อ</button></div></div></div><div className="dashboard-chart">{chartQuery.isError ? <p className="dashboard-empty-state">ไม่สามารถโหลดกราฟได้: {chartQuery.error.message}</p> : <Line data={chartData} options={chartOptions(chartMetric)} aria-label={chartMetric === 'sales' ? `กราฟยอดขาย${chartRangeTitle}` : `กราฟจำนวนรายการสั่งซื้อ${chartRangeTitle}`} role="img" />}</div></article></section>

    <section className="dashboard-dispatch-controls" aria-label="ตัวกรองสรุปรอบส่งและรายการสั่งซื้อที่ต้องติดตาม"><div className="dashboard-filter-card"><div className="dashboard-filter-groups"><div className="dashboard-filter-group"><p><CalendarDays size={16} aria-hidden="true" />กำหนดรอบส่ง</p><label>วันจัดส่ง<ThaiDatePicker value={date} onValueChange={setDate} ariaLabel="เลือกวันจัดส่ง" /></label><label>รอบส่ง<Select value={period} onValueChange={(value) => setPeriod(value as 'all' | AdminDeliveryPeriod)}><SelectTrigger aria-label="รอบส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem><SelectItem value="morning">รอบเช้า</SelectItem><SelectItem value="afternoon">รอบบ่าย</SelectItem></SelectContent></Select></label></div><div className="dashboard-filter-group"><p><MapPin size={16} aria-hidden="true" />จุดรับสินค้า</p><label>สถานที่รับสินค้า<Select value={String(locationId)} onValueChange={(value) => setLocationId(value === 'all' ? 'all' : Number(value))}><SelectTrigger aria-label="จุดรับสินค้า"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ทั้งหมด</SelectItem>{locations.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></label></div></div><button type="button" className="dashboard-reset-button" onClick={clearFilters}><RefreshCw size={16} aria-hidden="true" />ล้างตัวกรอง</button></div></section>

    <div className="admin-cards dashboard-kpis">
      <Link to="/admin/orders" className="dashboard-kpi"><span className="admin-card-icon mint"><Banknote size={22} aria-hidden="true" /></span><span><small>ยอดขายที่ชำระแล้ว</small><strong>{formatPrice(summary?.paidSalesTotal ?? 0)}</strong><p>มี {summary?.paidOrderCount ?? 0} รายการ <ArrowRight size={14} aria-hidden="true" /></p></span></Link>
      <Link to="/admin/orders" className="dashboard-kpi"><span className="admin-card-icon peach"><ClipboardList size={22} aria-hidden="true" /></span><span><small>แสดงรายการ</small><strong>{summary?.orderCount ?? 0} รายการ</strong><p>ดูรายการทั้งหมด <ArrowRight size={14} aria-hidden="true" /></p></span></Link>
      <Link to="/admin/dispatches-today" className="dashboard-kpi"><span className="admin-card-icon blue"><Truck size={22} aria-hidden="true" /></span><span><small>รอดำเนินการ</small><strong>{activeOrderCount} รายการ</strong><p className={activeOrderCount ? 'warning' : 'positive'}>{activeOrderCount ? <>ดูรายการ <ArrowRight size={14} aria-hidden="true" /></> : 'ไม่มีงานค้าง'}</p></span></Link>
      <a href="#dashboard-pending-orders" className="dashboard-kpi"><span className="admin-card-icon rose"><CircleAlert size={22} aria-hidden="true" /></span><span><small>รอชำระเงิน, ยกเลิก</small><strong>{summary?.pendingOrderCount ?? 0} รายการ</strong><p>ดูรายการ <ArrowRight size={14} aria-hidden="true" /></p></span></a>
    </div>

    <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>สรุปรอบส่งแยกตามจุดรับสินค้า</h2><p>ใช้ตรวจจำนวนงานและยอดขายก่อนเตรียมสินค้า</p></div><Link to="/admin/dispatches-today" className="admin-text-button">ดูจุดรับสินค้า <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="dashboard-table-scroll"><table className="dashboard-data-table dashboard-location-summary-table"><thead><tr><th>จุดรับสินค้า</th><th>รอบเช้า</th><th>รอบบ่าย</th><th>จ่ายแล้ว</th><th>รอดำเนินการ</th><th>ยอดขาย</th><th>ดูรายละเอียด</th></tr></thead><tbody>{locationSummary.length ? locationSummary.map((item) => <tr key={item.locationId}><td><strong>{item.locationName}</strong></td><td className="numeric">{item.morning}</td><td className="numeric">{item.afternoon}</td><td className="numeric">{item.paid}</td><td className="numeric">{item.active}</td><td className="numeric"><strong style={{ color: '#303934', fontWeight: 400 }}>{formatPrice(item.salesTotal)}</strong></td><td><Link className="admin-table-link" to="/admin/dispatches-today" aria-label={`ดูรายละเอียด ${item.locationName}`}><Eye size={18} aria-hidden="true" /></Link></td></tr>) : <tr><td colSpan={7} className="dashboard-empty-cell">ไม่มีรายการสั่งซื้อในตัวกรองนี้</td></tr>}</tbody></table></div></section>

    <section id="dashboard-pending-orders" className="dashboard-bottom-grid dashboard-orders-only">
      <article className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>รายการสั่งซื้อ (รอการชำระเงิน, ยกเลิก)</h2><p>แสดงรายการสั่งซื้อที่รอชำระเงินหรือยกเลิก</p></div><Link to="/admin/orders" className="admin-text-button">ดูรายการสั่งซื้อ <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="dashboard-table-scroll"><table className="dashboard-data-table dashboard-order-table"><thead><tr><th>เลขที่รายการสั่งซื้อ</th><th>ลูกค้า / จุดรับ</th><th>รอบส่ง</th><th>ยอดรวม</th><th>สถานะ</th><th>ดูรายละเอียด</th></tr></thead><tbody>{pendingOrders.length ? pendingOrders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong></td><td><strong>{order.userName}</strong><small>{order.locationName}</small></td><td><strong>{deliveryPeriods[order.deliveryPeriod].label}</strong></td><td className="numeric">{formatPrice(order.totalAmount)}</td><td><span className={`admin-status ${orderStatusClass(order.orderStatus)}`}>{orderStatusLabel(order.orderStatus)}</span></td><td><Link className="admin-table-link" to={`/admin/orders/${order.id}`} aria-label={`ดูรายละเอียดรายการสั่งซื้อ ${order.orderNumber}`}><Eye size={18} aria-hidden="true" /></Link></td></tr>) : <tr><td colSpan={6} className="dashboard-empty-cell">ไม่มีรายการสั่งซื้อที่รอชำระเงินหรือยกเลิก</td></tr>}</tbody></table></div></article>
    </section>
    <p className="dashboard-filter-summary dashboard-filter-summary-bottom"><CalendarDays size={18} aria-hidden="true" />ข้อมูลสำหรับวันที่ {formatDashboardDate(date)} ({periodSummary}){locationName ? ` · ${locationName}` : ''}</p>
  </>
}
