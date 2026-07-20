import { Check, Clock3, MapPin, Plus, Save, Store, Trash2 } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Input } from '@/components/ui/input'

type Location = { id: number; name: string; active: boolean }

export function SettingsPage() {
  const [morningCutoff, setMorningCutoff] = useState('08:00')
  const [morningDelivery, setMorningDelivery] = useState('09:00–10:00')
  const [afternoonCutoff, setAfternoonCutoff] = useState('12:00')
  const [afternoonDelivery, setAfternoonDelivery] = useState('14:00–15:00')
  const [locations, setLocations] = useState<Location[]>([{ id: 1, name: 'จุดรับสินค้า A', active: true }, { id: 2, name: 'จุดรับสินค้า B', active: true }, { id: 3, name: 'จุดรับสินค้า C', active: true }])
  const [locationName, setLocationName] = useState('')
  const [saved, setSaved] = useState(false)
  const addLocation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = locationName.trim()
    if (!name || locations.some((location) => location.name === name)) return
    setLocations((items) => [...items, { id: Date.now(), name, active: true }])
    setLocationName('')
  }
  const saveSchedule = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return <section className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">ตั้งค่าใช้ร่วมกันทุกจุดรับสินค้า</p><h1 className="admin-title">ตั้งค่ารอบส่งและสถานที่</h1></div></div>
    <section className="admin-detail-card"><div className="admin-section-heading"><div><h2><Clock3 size={21} aria-hidden="true" />รอบส่งภาพรวม</h2><p>เวลานี้มีผลกับทุกสถานที่ ลูกค้าจะสั่งได้เฉพาะรอบที่ยังไม่ปิดรับ</p></div><button type="button" className="admin-primary-button" onClick={saveSchedule} aria-live="polite"><Save size={18} aria-hidden="true" />{saved ? 'บันทึกแล้ว' : 'บันทึกเวลา'}</button></div><div className="schedule-grid"><label><strong>รอบเช้า</strong><span>ปิดรับออเดอร์</span><Input type="time" value={morningCutoff} onChange={(event) => setMorningCutoff(event.target.value)} /><span>เวลาจัดส่ง</span><Input value={morningDelivery} onChange={(event) => setMorningDelivery(event.target.value)} /></label><label><strong>รอบบ่าย</strong><span>ปิดรับออเดอร์</span><Input type="time" value={afternoonCutoff} onChange={(event) => setAfternoonCutoff(event.target.value)} /><span>เวลาจัดส่ง</span><Input value={afternoonDelivery} onChange={(event) => setAfternoonDelivery(event.target.value)} /></label></div></section>
    <section className="admin-detail-card location-settings"><div className="admin-section-heading"><div><h2><MapPin size={21} aria-hidden="true" />สถานที่รับสินค้า</h2><p>เพิ่มหรือปิดรับตามสถานที่ โดยใช้เวลารอบส่งภาพรวมเดียวกัน</p></div><span className="admin-status success">เปิดใช้งาน {locations.filter((location) => location.active).length} จุด</span></div><form className="location-add-form" onSubmit={addLocation}><label htmlFor="location-name" className="sr-only">ชื่อสถานที่รับสินค้าใหม่</label><Input id="location-name" value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="เช่น หน้าโรงเรียนชุมชน" /><button className="admin-primary-button" type="submit"><Plus size={18} aria-hidden="true" />เพิ่มสถานที่</button></form><ul className="location-list">{locations.map((location) => <li key={location.id}><span className="location-icon"><Store size={19} aria-hidden="true" /></span><strong>{location.name}</strong><button type="button" className={`location-toggle ${location.active ? 'active' : ''}`} onClick={() => setLocations((items) => items.map((item) => item.id === location.id ? { ...item, active: !item.active } : item))} aria-pressed={location.active}>{location.active ? 'เปิดรับ' : 'ปิดรับ'}</button><button type="button" className="product-delete" aria-label={`ลบ ${location.name}`} onClick={() => setLocations((items) => items.filter((item) => item.id !== location.id))}><Trash2 size={17} /></button></li>)}</ul></section>
    <p className="admin-page-note"><Check size={18} aria-hidden="true" /> ข้อมูลการตั้งค่าในหน้านี้เป็นม็อกอัปและเก็บสถานะระหว่างเปิดหน้านี้เท่านั้น</p>
  </section>
}
