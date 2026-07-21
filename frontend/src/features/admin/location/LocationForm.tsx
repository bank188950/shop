import { ArrowLeft, Save } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { getLocations, saveLocations, type AdminLocation } from './admin-locations'

export function LocationForm({ location }: { location?: AdminLocation }) {
  const [name, setName] = useState(location?.name ?? '')
  const [isActive, setIsActive] = useState(location?.isActive ?? true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextName = name.trim()
    const locations = getLocations()
    const hasDuplicateName = locations.some((item) => item.id !== location?.id && item.name === nextName)

    if (hasDuplicateName) {
      setError('มีชื่อสถานที่นี้แล้ว')
      return
    }

    const nextLocations = location
      ? locations.map((item) => item.id === location.id ? { ...item, name: nextName, isActive } : item)
      : [...locations, { id: Date.now(), name: nextName, isActive }]
    saveLocations(nextLocations)
    setSaved(true)
    window.setTimeout(() => navigate('/admin/locations'), 400)
  }

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/locations"><ArrowLeft size={18} />กลับไปหน้าสถานที่รับสินค้า</Link><h1 className="admin-title">{location ? 'แก้ไขสถานที่รับสินค้า' : 'เพิ่มสถานที่รับสินค้า'}</h1></div></div>
    <form className="product-form-card location-form-card" onSubmit={submit}>
      <label htmlFor="location-name">ชื่อสถานที่รับสินค้า<Input id="location-name" required value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="เช่น หน้าโรงเรียนชุมชน" aria-describedby={error ? 'location-name-error' : undefined} /></label>
      {error && <p id="location-name-error" className="location-form-error" role="alert">{error}</p>}
      <label className="location-active-toggle"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /><span>เปิดการใช้งาน</span></label>
      <div className="product-form-actions"><Link to="/admin/locations" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saved} aria-busy={saved}><Save size={18} aria-hidden="true" />{saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </form>
  </section>
}
