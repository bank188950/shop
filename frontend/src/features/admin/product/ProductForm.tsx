import { ArrowLeft, ImagePlus, Save } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { AdminProduct } from './admin-products'

export function ProductForm({ product }: { product?: AdminProduct }) {
  const [saved, setSaved] = useState(false)
  const [category, setCategory] = useState(product?.category ?? '')
  const [piecesPerStick, setPiecesPerStick] = useState(String(product?.piecesPerStick ?? 1))
  const [unit, setUnit] = useState(product?.unit ?? '')
  const [isActive, setIsActive] = useState(product?.isActive ?? true)
  const [imageUrl, setImageUrl] = useState(product?.image ?? '')
  const navigate = useNavigate()
  function selectImage(file: File | undefined) { if (file) setImageUrl(URL.createObjectURL(file)) }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaved(true); window.setTimeout(() => navigate('/admin/products'), 700) }
  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/products"><ArrowLeft size={18} />กลับไปหน้าสินค้า</Link><h1 className="admin-title">{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h1></div></div>
    <form className="product-form-card" onSubmit={submit}>
      <div className="product-form-grid"><label>ชื่อสินค้า<Input required defaultValue={product?.name} placeholder="เช่น ลูกชิ้นหมูพรีเมียม" /></label><label>หมวดหมู่<Select value={category || undefined} onValueChange={setCategory}><SelectTrigger aria-label="หมวดหมู่สินค้า" aria-required="true"><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger><SelectContent><SelectItem value="ลูกชิ้น">ลูกชิ้น</SelectItem><SelectItem value="ไส้กรอก">ไส้กรอก</SelectItem><SelectItem value="เครื่องดื่ม">เครื่องดื่ม</SelectItem></SelectContent></Select></label></div>
      <div className="product-pricing-grid"><label>ราคา (บาท)<Input type="number" min="0" required defaultValue={product?.price} placeholder="0" /></label><label>จำนวนสินค้า<Input type="number" min="0" required defaultValue={product?.stock.match(/\d+/)?.[0]} placeholder="0" /></label><label>จำนวนชิ้น<Input type="number" min="0" required defaultValue={product?.pieceCount} placeholder="0" /></label><label>จำนวนชิ้นต่อ (1 สินค้า)<Select value={piecesPerStick} onValueChange={setPiecesPerStick}><SelectTrigger aria-label="จำนวนชิ้นต่อ 1 สินค้า"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <SelectItem key={item} value={String(item)}>{item}</SelectItem>)}</SelectContent></Select></label><label>หน่วยสินค้า<Select value={unit || undefined} onValueChange={setUnit}><SelectTrigger aria-label="หน่วยสินค้า" aria-required="true"><SelectValue placeholder="เลือกหน่วยสินค้า" /></SelectTrigger><SelectContent>{['ชิ้น', 'ไม้', 'กล่อง', 'แพ็ก', 'ถุง', 'แก้ว', 'ขวด'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label><label>แจ้งเตือนสต็อกต่ำ<Input type="number" min="0" required defaultValue={product?.lowStockThreshold ?? 5} placeholder="5" /></label></div>
      <label className="product-form-full">รายละเอียดสินค้า<Textarea rows={4} defaultValue={product?.detail} placeholder="ระบุขนาด หรือจำนวนต่อไม้" /></label>
      <div className="product-image-upload"><ImagePlus size={27} /><div><strong>อัปโหลดรูปสินค้า</strong><span>รองรับ JPG, PNG ขนาดไม่เกิน 5 MB</span></div><Input type="file" accept="image/png,image/jpeg" aria-label="อัปโหลดรูปสินค้า" onChange={(event) => selectImage(event.target.files?.[0])} /></div>
      {imageUrl && <div className="product-image-preview"><strong>ตัวอย่างรูปสินค้า</strong><img src={imageUrl} alt="ตัวอย่างรูปสินค้า" /></div>}
      <label className="product-active-toggle"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /><span>เปิดการใช้งาน</span></label>
      <div className="product-form-actions"><Link to="/admin/products" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saved} aria-busy={saved}><Save size={18} />{saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </form>
  </section>
}
