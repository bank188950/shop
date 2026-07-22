import { ArrowLeft, ImagePlus, Save } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import type { AdminBanner } from './admin-banners'

export function BannerForm({ banner }: { banner?: AdminBanner }) {
  const [title, setTitle] = useState(banner?.title ?? '')
  const [imageUrl, setImageUrl] = useState(banner?.image ?? '')
  const [isActive, setIsActive] = useState(banner?.isActive ?? true)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  function selectImage(file: File | undefined) {
    if (!file) return
    setImageUrl(URL.createObjectURL(file))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
    window.setTimeout(() => navigate('/admin/banners'), 700)
  }

  return <section className="admin-page banner-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/banners"><ArrowLeft size={18} />กลับไปหน้าแบนเนอร์</Link><h1 className="admin-title">{banner ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์'}</h1></div></div>
    <form className="banner-form-card" onSubmit={submit}>
      <label htmlFor="banner-title">หัวข้อ<Input id="banner-title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="กรอกหัวข้อแบนเนอร์" /></label>
      <div className="banner-image-upload"><ImagePlus size={27} aria-hidden="true" /><div><strong>อัปโหลดรูปภาพแบนเนอร์</strong><span>รองรับ JPG, PNG ขนาดไม่เกิน 5 MB</span></div><Input type="file" accept="image/png,image/jpeg" aria-label="อัปโหลดรูปภาพแบนเนอร์" onChange={(event) => selectImage(event.target.files?.[0])} /></div>
      {imageUrl && <div className="banner-draft-preview"><strong>ตัวอย่างแบนเนอร์</strong><img src={imageUrl} alt={title || 'ตัวอย่างแบนเนอร์'} /></div>}
      <label className="product-active-toggle"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /><span>เปิดการใช้งาน</span></label>
      <div className="banner-form-actions"><Link to="/admin/banners" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saved} aria-busy={saved}><Save size={18} aria-hidden="true" />{saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </form>
  </section>
}
