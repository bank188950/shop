import { ArrowLeft, ImagePlus, Save } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { AdminProduct } from './admin-products'

export function ProductForm({ product }: { product?: AdminProduct }) {
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaved(true); window.setTimeout(() => navigate('/admin/products'), 700) }
  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/products"><ArrowLeft size={18} />กลับไปหน้าสินค้า</Link><h1 className="admin-title">{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h1></div></div>
    <form className="product-form-card" onSubmit={submit}>
      <div className="product-form-grid"><label>ชื่อสินค้า<input required defaultValue={product?.name} placeholder="เช่น ลูกชิ้นหมูพรีเมียม" /></label><label>หมวดหมู่<select required defaultValue={product?.category ?? ''}><option value="" disabled>เลือกหมวดหมู่</option><option>ลูกชิ้น</option><option>ไส้กรอก</option><option>เครื่องดื่ม</option></select></label><label>ราคา (บาท)<input type="number" min="0" required defaultValue={product?.price} placeholder="0" /></label><label>จำนวนคงเหลือ<input type="number" min="0" required defaultValue={product?.stock.match(/\d+/)?.[0]} placeholder="0" /></label></div>
      <label className="product-form-full">รายละเอียดสินค้า<textarea rows={4} defaultValue={product?.detail} placeholder="ระบุขนาด หรือจำนวนต่อไม้" /></label>
      <div className="product-image-upload"><ImagePlus size={27} /><div><strong>อัปโหลดรูปสินค้า</strong><span>รองรับ JPG, PNG ขนาดไม่เกิน 5 MB</span></div><input type="file" accept="image/png,image/jpeg" aria-label="อัปโหลดรูปสินค้า" /></div>
      <div className="product-form-actions"><Link to="/admin/products" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saved} aria-busy={saved}><Save size={18} />{saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </form>
  </section>
}
