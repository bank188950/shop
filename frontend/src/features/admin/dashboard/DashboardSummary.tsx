import { Bar, Line } from 'react-chartjs-2'
import { BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip, type TooltipItem } from 'chart.js'
import { ArrowUpRight, Boxes, CircleAlert, ClipboardList, WalletCards } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)

const salesData = {
  labels: ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'],
  datasets: [{
    label: 'ยอดขาย',
    data: [6240, 7180, 6490, 7920, 8640, 9130, 7860],
    borderColor: '#267053',
    backgroundColor: '#26705320',
    fill: true,
    tension: .35,
    pointBackgroundColor: '#267053',
    pointRadius: 3,
  }],
}

const orderData = {
  labels: ['09:00', '12:00', '15:00', '18:00', '21:00'],
  datasets: [{
    label: 'ออเดอร์',
    data: [4, 9, 6, 11, 7],
    backgroundColor: '#b8f2d8',
    borderColor: '#218b64',
    borderWidth: 1,
    borderRadius: 6,
  }],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { displayColors: false, backgroundColor: '#183326', padding: 10 },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#65716a', font: { family: 'Sarabun' } } },
    y: { beginAtZero: true, border: { display: false }, grid: { color: '#e3e8e4' }, ticks: { color: '#65716a', font: { family: 'Sarabun' } } },
  },
}

const salesChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    tooltip: {
      ...chartOptions.plugins.tooltip,
      callbacks: { label: (context: TooltipItem<'line'>) => `${(context.parsed.y ?? 0).toLocaleString('th-TH')} บาท` },
    },
  },
}

export function DashboardSummary() {
  return <>
    <div className="admin-cards">
      <article><span className="admin-card-icon mint"><ClipboardList size={22} /></span><div><small>ออเดอร์วันนี้</small><strong>24 รายการ</strong><p className="positive"><ArrowUpRight size={14} />เพิ่มขึ้น 12%</p></div></article>
      <article><span className="admin-card-icon peach"><WalletCards size={22} /></span><div><small>ยอดขายวันนี้</small><strong>8,640 บาท</strong><p className="positive"><ArrowUpRight size={14} />เพิ่มขึ้น 8%</p></div></article>
      <article><span className="admin-card-icon green"><Boxes size={22} /></span><div><small>สินค้าคงเหลือ</small><strong>42 รายการ</strong><p>พร้อมจำหน่าย</p></div></article>
      <article><span className="admin-card-icon rose"><CircleAlert size={22} /></span><div><small>สต็อกใกล้หมด</small><strong>5 รายการ</strong><p className="warning">ต้องตรวจสอบ</p></div></article>
    </div>
    <section className="dashboard-charts" aria-label="สรุปแนวโน้มร้านค้า">
      <article className="dashboard-chart-card"><div><h2>ยอดขาย 7 วันล่าสุด</h2><p>ติดตามรายได้รวมในแต่ละวัน</p></div><div className="dashboard-chart"><Line data={salesData} options={salesChartOptions} aria-label="กราฟยอดขาย 7 วันล่าสุด" role="img" /></div></article>
      <article className="dashboard-chart-card"><div><h2>ออเดอร์ตามช่วงเวลา</h2><p>ดูช่วงเวลาที่มีออเดอร์หนาแน่น</p></div><div className="dashboard-chart"><Bar data={orderData} options={chartOptions} aria-label="กราฟจำนวนออเดอร์ตามช่วงเวลา" role="img" /></div></article>
    </section>
    <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>รายการที่ต้องดำเนินการ</h2><p>ติดตามงานสำคัญของร้านในวันนี้</p></div><button type="button" className="admin-text-button">ดูออเดอร์ทั้งหมด</button></div><div className="admin-task-list"><article><span className="admin-task-icon orange"><CircleAlert size={20} /></span><div><strong>สินค้าคงเหลือต่ำ 5 รายการ</strong><p>กรุณาเติมสินค้าเพื่อไม่ให้การขายสะดุด</p></div><button type="button">ตรวจสอบ</button></article><article><span className="admin-task-icon blue"><ClipboardList size={20} /></span><div><strong>มี 3 ออเดอร์รอจัดส่ง</strong><p>ลูกค้ารอรับสินค้าในรอบจัดส่งถัดไป</p></div><button type="button">ดูออเดอร์</button></article></div></section>
  </>
}
