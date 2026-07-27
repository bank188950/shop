import { CalendarDays, CircleAlert, Save, Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThaiDatePicker } from '@/components/ui/thai-date-picker'

type CleanupPeriod = 'day' | 'month' | 'year'

const periodOptions: { value: CleanupPeriod, label: string, description: string }[] = [
  { value: 'day', label: 'รายวัน', description: 'ลบเฉพาะรายการของวันที่เลือก' },
  { value: 'month', label: 'รายเดือน', description: 'ลบรายการทั้งหมดของเดือนที่เลือก' },
  { value: 'year', label: 'รายปี', description: 'ลบรายการทั้งหมดของปีที่เลือก' },
]

const mockOrderCounts: Record<CleanupPeriod, number> = { day: 8, month: 53, year: 612 }

export function OrderCleanupPage() {
  const [period, setPeriod] = useState<CleanupPeriod>('day')
  const [date, setDate] = useState('2026-07-27')
  const [month, setMonth] = useState('2026-07')
  const [year, setYear] = useState('2569')
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const count = mockOrderCounts[period]
  const selectedPeriod = periodOptions.find((option) => option.value === period)!

  function submitMockup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAcknowledged) return
    setIsSaved(true)
  }

  return <section className="admin-page order-cleanup-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">ล้างรายการสั่งซื้อ</h1></div></div>
    <form className="admin-detail-card order-cleanup-card" onSubmit={submitMockup}>
      <div className="admin-section-heading"><div><h2><Trash2 size={21} aria-hidden="true" />เลือกช่วงเวลาที่ต้องการล้าง</h2><p>Mockup นี้ยังไม่ลบข้อมูลจริง</p></div></div>
      <div className="order-cleanup-period-picker" role="group" aria-label="เลือกรูปแบบการล้างรายการสั่งซื้อ">
        {periodOptions.map((option) => <button key={option.value} type="button" className={period === option.value ? 'is-selected' : ''} onClick={() => { setPeriod(option.value); setIsSaved(false) }} aria-pressed={period === option.value}><strong>{option.label}</strong><span>{option.description}</span></button>)}
      </div>
      <label className="order-cleanup-date-field"><span><CalendarDays size={18} aria-hidden="true" />{period === 'day' ? 'เลือกวันที่จัดส่ง' : period === 'month' ? 'เลือกเดือนจัดส่ง' : 'เลือกปีจัดส่ง'}</span>
        {period === 'day' && <ThaiDatePicker value={date} onValueChange={(value) => { setDate(value); setIsSaved(false) }} ariaLabel="เลือกวันที่จัดส่ง" />}
        {period === 'month' && <ThaiDatePicker mode="month" value={month} onValueChange={(value) => { setMonth(value); setIsSaved(false) }} ariaLabel="เลือกเดือนจัดส่ง" />}
        {period === 'year' && <Select value={year} onValueChange={(value) => { setYear(value); setIsSaved(false) }}><SelectTrigger aria-label="เลือกปีจัดส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2567">2567</SelectItem><SelectItem value="2568">2568</SelectItem><SelectItem value="2569">2569</SelectItem><SelectItem value="2570">2570</SelectItem></SelectContent></Select>}
      </label>
      <section className="order-cleanup-summary" aria-live="polite"><span className="order-cleanup-summary-icon"><CircleAlert size={21} aria-hidden="true" /></span><div><strong>พบรายการสั่งซื้อ {count} รายการ</strong><p>{selectedPeriod.description} พร้อมรายการสินค้า การชำระเงิน และสลิปที่เกี่ยวข้อง</p></div></section>
      <label className="order-cleanup-confirm"><input type="checkbox" checked={isAcknowledged} onChange={(event) => { setIsAcknowledged(event.target.checked); setIsSaved(false) }} /><span><strong>รับทราบว่าการล้างข้อมูลไม่สามารถกู้คืนได้</strong><small>เมื่อเชื่อมระบบจริง จะมี popup ยืนยันอีกครั้งก่อนลบ</small></span></label>
      {isSaved && <p className="order-cleanup-mock-status" role="status">บันทึกตัวอย่างแล้ว — Mockup นี้ยังไม่ได้ลบข้อมูล</p>}
      <div className="settings-save-action"><button type="submit" className="order-cleanup-save" disabled={!isAcknowledged}><Save size={18} aria-hidden="true" />บันทึก</button></div>
    </form>
  </section>
}
