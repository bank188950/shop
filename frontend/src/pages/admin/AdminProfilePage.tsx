import { ImagePlus, Save, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

export function AdminProfilePage() {
  const [name, setName] = useState('Admin Profile')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saved, setSaved] = useState(false)

  const saveProfile = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  const selectAvatar = (file: File | undefined) => {
    if (file) setAvatarUrl(URL.createObjectURL(file))
  }

  return <section className="admin-page">
    <div className="admin-page-heading admin-profile-page-heading">
      <div><h1 className="admin-title">Admin Profile</h1></div>
    </div>
    <section className="admin-detail-card admin-profile-card">
      <div className="admin-section-heading"><div><h2><UserRound size={21} aria-hidden="true" />ข้อมูลผู้ดูแลระบบ</h2><p>จัดการข้อมูลสำหรับบัญชีผู้ดูแลระบบ</p></div></div>
      <div className="admin-profile-form">
        <label htmlFor="admin-username"><span>Username</span><Input id="admin-username" value="admin" disabled /></label>
        <label htmlFor="admin-name"><span>Name</span><Input id="admin-name" value={name} onChange={(event) => setName(event.target.value)} /></label>
        <div className="admin-profile-icon-field"><span>ไอคอนผู้ดูแลระบบ</span><div className="banner-image-upload admin-profile-image-upload"><ImagePlus size={27} aria-hidden="true" /><div><strong>อัปโหลดไอคอนผู้ดูแลระบบ</strong><span>รองรับ JPG, PNG ขนาดไม่เกิน 5 MB</span></div><Input id="admin-avatar" type="file" accept="image/png,image/jpeg" aria-label="อัปโหลดไอคอนผู้ดูแลระบบ" onChange={(event) => selectAvatar(event.target.files?.[0])} /></div>{avatarUrl && <div className="admin-profile-avatar-preview"><strong>ตัวอย่างไอคอน</strong><span className="admin-profile-form-avatar"><img src={avatarUrl} alt="ตัวอย่างไอคอนผู้ดูแลระบบ" /></span></div>}</div>
      </div>
      <div className="settings-save-action"><button type="button" className="admin-primary-button" onClick={saveProfile} aria-live="polite"><Save size={18} aria-hidden="true" />{saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </section>
  </section>
}
