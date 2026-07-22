import { BellRing, Clock3, Megaphone, Save } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function SettingsPage() {
  const [morningCutoff, setMorningCutoff] = useState('08:00')
  const [morningDelivery, setMorningDelivery] = useState('09:00–10:00')
  const [afternoonCutoff, setAfternoonCutoff] = useState('12:00')
  const [afternoonDelivery, setAfternoonDelivery] = useState('14:00–15:00')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [isNoticePopupEnabled, setIsNoticePopupEnabled] = useState(false)
  const [advertisementText, setAdvertisementText] = useState('')
  const [isAdvertisementVisible, setIsAdvertisementVisible] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveSettings = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return <section className="admin-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">ตั้งค่า</h1></div></div>
    <section className="admin-detail-card">
      <div className="admin-section-heading"><div><h2><Clock3 size={21} aria-hidden="true" />ตั้งค่ารอบส่ง</h2><p>เวลานี้มีผลกับทุกสถานที่ ลูกค้าจะสั่งได้เฉพาะรอบที่ยังไม่ปิดรับ</p></div></div>
      <div className="schedule-grid">
        <label><strong>รอบเช้า</strong><span>ปิดรับออเดอร์</span><Input type="time" value={morningCutoff} onChange={(event) => setMorningCutoff(event.target.value)} /><span>เวลาจัดส่ง</span><Input value={morningDelivery} onChange={(event) => setMorningDelivery(event.target.value)} /></label>
        <label><strong>รอบบ่าย</strong><span>ปิดรับออเดอร์</span><Input type="time" value={afternoonCutoff} onChange={(event) => setAfternoonCutoff(event.target.value)} /><span>เวลาจัดส่ง</span><Input value={afternoonDelivery} onChange={(event) => setAfternoonDelivery(event.target.value)} /></label>
      </div>
      <div className="notice-settings">
        <div className="admin-section-heading"><div><h2><BellRing size={21} aria-hidden="true" />ตั้งค่าการแจ้งข้อมูลเตือน</h2><p>เตรียมข้อความและสถานะ popup สำหรับใช้บนหน้าร้านในอนาคต</p></div></div>
        <label className="notice-message-label" htmlFor="customer-notice"><span className="sr-only">รายละเอียด popup</span><Textarea id="customer-notice" value={noticeMessage} onChange={(event) => setNoticeMessage(event.target.value)} rows={4} placeholder="รายละเอียดที่กรอกจะไปแสดงใน popup" /></label>
        <label className="notice-popup-toggle"><input type="checkbox" checked={isNoticePopupEnabled} onChange={(event) => setIsNoticePopupEnabled(event.target.checked)} /><span><strong>เปิดการใช้งาน</strong></span></label>
      </div>
      <div className="notice-settings">
        <div className="admin-section-heading"><div><h2><Megaphone size={21} aria-hidden="true" />ตั้งค่าโฆษณา</h2><p>กำหนดข้อความและการแสดงโฆษณาบนหน้าร้าน</p></div></div>
        <label className="notice-message-label" htmlFor="advertisement-text"><strong>คำโฆษณา</strong><Input id="advertisement-text" value={advertisementText} onChange={(event) => setAdvertisementText(event.target.value)} placeholder="กรอกคำโฆษณา" /></label>
        <label className="notice-popup-toggle"><input type="checkbox" checked={isAdvertisementVisible} onChange={(event) => setIsAdvertisementVisible(event.target.checked)} /><span><strong>แสดงโฆษณา</strong></span></label>
      </div>
      <div className="settings-save-action"><button type="button" className="admin-primary-button" onClick={saveSettings} aria-live="polite"><Save size={18} aria-hidden="true" />{saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </section>
  </section>
}
