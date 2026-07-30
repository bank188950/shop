import { CalendarDays, CircleAlert, Eraser, Save } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import Swal from 'sweetalert2'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThaiDatePicker } from '@/components/ui/thai-date-picker'
import { useClearSlipFiles, useSlipCleanupCount } from '@/features/admin/order-cleanup/hooks/useOrderCleanup'
import type { CleanupPeriod } from '@/api/admin/order-cleanup'

const periodOptions: { value: CleanupPeriod, label: string, description: string }[] = [
  { value: 'day', label: 'รายวัน', description: 'ล้างไฟล์สลิปของวันที่เลือก' },
  { value: 'month', label: 'รายเดือน', description: 'ล้างไฟล์สลิปทั้งหมดของเดือนที่เลือก' },
  { value: 'year', label: 'รายปี', description: 'ล้างไฟล์สลิปทั้งหมดของปีที่เลือก' },
]

const todayValue = new Date().toISOString().slice(0, 10)

export function OrderCleanupPage() {
  const [period, setPeriod] = useState<CleanupPeriod>('day')
  const [date, setDate] = useState(todayValue)
  const [month, setMonth] = useState(todayValue.slice(0, 7))
  const [year, setYear] = useState(String(new Date().getFullYear() + 543))
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [status, setStatus] = useState('')

  // ปีเป็นพุทธศักราชตาม dropdown ส่วนวันและเดือนเป็นคริสต์ศักราชตามที่ ThaiDatePicker คืนค่ามา
  const value = period === 'day' ? date : period === 'month' ? month : year
  const target = { period, value }
  const countQuery = useSlipCleanupCount(target)
  const clearMutation = useClearSlipFiles()
  const slipCount = countQuery.data ?? 0
  const selectedPeriod = periodOptions.find((option) => option.value === period)!

  function changeTarget(apply: () => void) {
    apply()
    setIsAcknowledged(false)
    setStatus('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAcknowledged || !slipCount) return

    const result = await Swal.fire({
      title: 'ยืนยันการล้างไฟล์สลิป',
      html: `<span>คุณต้องการล้างไฟล์สลิป ${slipCount} ไฟล์</span><span class="order-cleanup-confirm-message">ตามช่วงเวลาที่เลือกใช่หรือไม่</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#c73b34',
      cancelButtonColor: '#607168',
      reverseButtons: true,
      focusCancel: true,
      customClass: { icon: 'delete-alert-icon' },
    })
    if (!result.isConfirmed) return

    try {
      const response = await clearMutation.mutateAsync(target)
      setStatus(response.message)
      setIsAcknowledged(false)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'ไม่สามารถล้างไฟล์สลิปได้')
    }
  }

  return <section className="admin-page order-cleanup-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">ล้างไฟล์สลิป</h1></div></div>
    <form className="admin-detail-card order-cleanup-card" onSubmit={submit}>
      <div className="admin-section-heading"><div><h2><Eraser size={21} aria-hidden="true" />เลือกช่วงเวลาที่ต้องการล้าง</h2><p>ล้างเฉพาะไฟล์รูปสลิป โดยยังเก็บข้อมูลการชำระเงินไว้ตรวจสอบย้อนหลังได้</p></div></div>
      <div className="order-cleanup-period-picker" role="group" aria-label="เลือกรูปแบบการล้างไฟล์สลิป">
        {periodOptions.map((option) => <button key={option.value} type="button" className={period === option.value ? 'is-selected' : ''} onClick={() => changeTarget(() => setPeriod(option.value))} aria-pressed={period === option.value}><strong>{option.label}</strong><span>{option.description}</span></button>)}
      </div>
      <label className="order-cleanup-date-field"><span><CalendarDays size={18} aria-hidden="true" />{period === 'day' ? 'เลือกวันที่จัดส่ง' : period === 'month' ? 'เลือกเดือนจัดส่ง' : 'เลือกปีจัดส่ง'}</span>
        {period === 'day' && <ThaiDatePicker value={date} onValueChange={(next) => changeTarget(() => setDate(next))} ariaLabel="เลือกวันที่จัดส่ง" />}
        {period === 'month' && <ThaiDatePicker mode="month" value={month} onValueChange={(next) => changeTarget(() => setMonth(next))} ariaLabel="เลือกเดือนจัดส่ง" />}
        {period === 'year' && <Select value={year} onValueChange={(next) => changeTarget(() => setYear(next))}><SelectTrigger aria-label="เลือกปีจัดส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2567">2567</SelectItem><SelectItem value="2568">2568</SelectItem><SelectItem value="2569">2569</SelectItem><SelectItem value="2570">2570</SelectItem></SelectContent></Select>}
      </label>
      <section className="order-cleanup-summary" aria-live="polite"><span className="order-cleanup-summary-icon"><CircleAlert size={21} aria-hidden="true" /></span><div><strong>{countQuery.isLoading ? 'กำลังนับไฟล์สลิป...' : countQuery.isError ? 'ไม่สามารถนับไฟล์สลิปได้' : `พบไฟล์สลิป ${slipCount} ไฟล์`}</strong><p>{selectedPeriod.description} โดยยังเก็บยอดเงิน เวลาโอน ชื่อผู้โอน และเลขอ้างอิงธุรกรรมไว้</p></div></section>
      <label className="order-cleanup-confirm"><input type="checkbox" checked={isAcknowledged} onChange={(event) => { setIsAcknowledged(event.target.checked); setStatus('') }} /><span><strong>รับทราบว่าไฟล์รูปสลิปที่ล้างแล้วไม่สามารถกู้คืนได้</strong><small>กดบันทึกเพื่อยืนยันการทำรายการ</small></span></label>
      {status && <p className="order-cleanup-mock-status" role="status">{status}</p>}
      <div className="settings-save-action"><button type="submit" className="order-cleanup-save" disabled={!isAcknowledged || !slipCount || clearMutation.isPending}><Save size={18} aria-hidden="true" />{clearMutation.isPending ? 'กำลังล้างไฟล์สลิป' : 'บันทึก'}</button></div>
    </form>
  </section>
}
