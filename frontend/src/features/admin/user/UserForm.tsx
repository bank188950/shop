import { ArrowLeft, Save } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getLocations } from '@/features/admin/location/admin-locations'
import { getAdminUsers, saveAdminUsers, type AdminUser } from './admin-users'

export function UserForm({ user }: { user?: AdminUser }) {
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [lineId, setLineId] = useState(user?.lineId ?? '')
  const [location, setLocation] = useState(user?.location ?? '')
  const [isActive, setIsActive] = useState(user?.isActive ?? true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  const locations = useMemo(() => getLocations().filter((item) => item.isActive || item.name === user?.location), [user?.location])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextPhone = phone.trim()
    const users = getAdminUsers()
    if (users.some((item) => item.id !== user?.id && item.phone === nextPhone)) {
      setError('มีผู้ใช้งานที่ใช้เบอร์โทรศัพท์นี้แล้ว')
      return
    }

    const nextUser: AdminUser = { id: user?.id ?? Date.now(), name: name.trim(), phone: nextPhone, lineId: lineId.trim(), location, isActive }
    const nextUsers = user ? users.map((item) => item.id === user.id ? nextUser : item) : [...users, nextUser]
    saveAdminUsers(nextUsers)
    setSaved(true)
    window.setTimeout(() => navigate('/admin/users'), 400)
  }

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/users"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าผู้ใช้งาน</Link><h1 className="admin-title">{user ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน'}</h1></div></div>
    <form className="product-form-card user-form-card" onSubmit={submit}>
      <div className="product-form-grid"><label>ชื่อลูกค้า<Input required value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="เช่น คุณบอม" /></label><label>เบอร์โทรศัพท์<Input required type="tel" inputMode="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setError('') }} placeholder="0812345678" aria-describedby={error ? 'user-phone-error' : undefined} /></label><label>LINE ID<Input required value={lineId} onChange={(event) => setLineId(event.target.value)} placeholder="เช่น @bom_eats" /></label><label>จุดรับสินค้า<Select value={location || undefined} onValueChange={setLocation}><SelectTrigger aria-label="จุดรับสินค้า" aria-required="true"><SelectValue placeholder="เลือกจุดรับสินค้า" /></SelectTrigger><SelectContent>{locations.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select></label></div>
      {error && <p id="user-phone-error" className="location-form-error" role="alert">{error}</p>}
      <label className="product-active-toggle"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /><span>เปิดการใช้งาน</span></label>
      <div className="product-form-actions"><Link to="/admin/users" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saved} aria-busy={saved}><Save size={18} aria-hidden="true" />{saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </form>
  </section>
}
