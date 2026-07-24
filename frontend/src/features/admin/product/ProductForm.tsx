import { ArrowLeft, CircleAlert, ImagePlus, Minus, Plus, RotateCcw, Save, Settings2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getProductUnits } from '@/features/admin/unit/admin-units'
import type { AdminProduct } from './admin-products'

type StockAction = 'add' | 'reduce' | 'clear' | null

export function ProductForm({ product }: { product?: AdminProduct }) {
  const [saved, setSaved] = useState(false)
  const [productName, setProductName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [piecesPerStick, setPiecesPerStick] = useState(String(product?.piecesPerStick ?? 1))
  const [unit, setUnit] = useState(product?.unit ?? '')
  const [isActive, setIsActive] = useState(product?.isActive ?? true)
  const [imageUrl, setImageUrl] = useState(product?.image ?? '')
  const [stock, setStock] = useState(Number(product?.stock.match(/\d+/)?.[0] ?? 0))
  const [stockAction, setStockAction] = useState<StockAction>(null)
  const [stockQuantity, setStockQuantity] = useState('')
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const navigate = useNavigate()
  const stockActionLabel = stockAction === 'add' ? 'เพิ่มสินค้า' : 'ลดสินค้า'

  function selectImage(file: File | undefined) { if (file) setImageUrl(URL.createObjectURL(file)) }

  function closeStockDialog() {
    setStockAction(null)
    setStockQuantity('')
    setIsStockDialogOpen(false)
  }

  function openStockDialog() {
    setStockAction(null)
    setStockQuantity('')
    setIsStockDialogOpen(true)
  }

  function confirmStockAction() {
    if (!stockAction) return

    if (stockAction === 'clear') {
      setStock(0)
      closeStockDialog()
      return
    }

    const quantity = Number(stockQuantity)
    if (!Number.isFinite(quantity) || quantity <= 0) return
    setStock((current) => stockAction === 'add' ? current + quantity : Math.max(0, current - quantity))
    closeStockDialog()
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
    window.setTimeout(() => navigate('/admin/products'), 700)
  }

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/products"><ArrowLeft size={18} />กลับไปหน้าสินค้า</Link><h1 className="admin-title">{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h1></div></div>
    <form className="product-form-card" onSubmit={submit}>
      <div className="product-form-grid"><label>ชื่อสินค้า<Input required value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="เช่น ลูกชิ้นหมูพรีเมียม" /></label><label>หมวดหมู่<Select value={category || undefined} onValueChange={setCategory}><SelectTrigger aria-label="หมวดหมู่สินค้า" aria-required="true"><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger><SelectContent><SelectItem value="ลูกชิ้น">ลูกชิ้น</SelectItem><SelectItem value="ไส้กรอก">ไส้กรอก</SelectItem><SelectItem value="เครื่องดื่ม">เครื่องดื่ม</SelectItem></SelectContent></Select></label></div>
      <div className="product-pricing-grid"><label>ราคา (บาท)<Input type="number" min="0" required defaultValue={product?.price} placeholder="0" /></label><label>จำนวนสินค้า<div className="product-stock-control"><Input className="product-stock-input" type="number" value={stock} disabled aria-label="จำนวนสินค้าปัจจุบัน" /><button type="button" className="product-stock-open-button" onClick={openStockDialog} aria-label="จัดการจำนวนสินค้า"><Settings2 size={20} aria-hidden="true" /></button></div></label><label>จำนวนชิ้น<Input type="number" min="0" required defaultValue={product?.pieceCount} placeholder="0" /></label><label>จำนวนชิ้นต่อ (1 สินค้า)<Select value={piecesPerStick} onValueChange={setPiecesPerStick}><SelectTrigger aria-label="จำนวนชิ้นต่อ 1 สินค้า"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <SelectItem key={item} value={String(item)}>{item}</SelectItem>)}</SelectContent></Select></label><label>หน่วยสินค้า<Select value={unit || undefined} onValueChange={setUnit}><SelectTrigger aria-label="หน่วยสินค้า" aria-required="true"><SelectValue placeholder="เลือกหน่วยสินค้า" /></SelectTrigger><SelectContent>{getProductUnits().map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select></label><label>แจ้งเตือนสต็อกต่ำ<Input type="number" min="0" required defaultValue={product?.lowStockThreshold ?? 5} placeholder="5" /></label></div>
      <label className="product-form-full">รายละเอียดสินค้า<Textarea rows={4} defaultValue={product?.detail} placeholder="ระบุขนาด หรือจำนวนต่อไม้" /></label>
      <div className="product-image-upload"><ImagePlus size={27} /><div><strong>อัปโหลดรูปสินค้า</strong><span>รองรับ JPG, PNG ขนาดไม่เกิน 5 MB</span></div><Input type="file" accept="image/png,image/jpeg" aria-label="อัปโหลดรูปสินค้า" onChange={(event) => selectImage(event.target.files?.[0])} /></div>
      {imageUrl && <div className="product-image-preview"><strong>ตัวอย่างรูปสินค้า</strong><img src={imageUrl} alt="ตัวอย่างรูปสินค้า" /></div>}
      <label className="product-active-toggle"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /><span>เปิดการใช้งาน</span></label>
      <div className="product-form-actions"><Link to="/admin/products" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saved} aria-busy={saved}><Save size={18} />{saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </form>

    <Dialog open={isStockDialogOpen} onOpenChange={(open) => { if (!open) closeStockDialog() }}>
      <DialogContent className="product-stock-dialog" showCloseButton={false}>
        <DialogHeader><DialogTitle>{stockAction === null ? 'จัดการจำนวนสินค้า' : stockAction === 'clear' ? 'ล้างสินค้า' : stockActionLabel}</DialogTitle></DialogHeader>
        <p className="product-stock-current">จำนวนสินค้าปัจจุบัน <strong>{stock} {product?.unit}</strong></p>
        <div className="product-stock-mode-actions" role="group" aria-label="เลือกการจัดการสินค้า"><button type="button" className={stockAction === 'add' ? 'is-selected' : ''} onClick={() => setStockAction('add')}><Plus size={20} aria-hidden="true" />เพิ่ม</button><button type="button" className={stockAction === 'reduce' ? 'is-selected' : ''} onClick={() => setStockAction('reduce')}><Minus size={20} aria-hidden="true" />ลด</button><button type="button" className={`product-stock-clear ${stockAction === 'clear' ? 'is-selected' : ''}`} onClick={() => setStockAction('clear')}><RotateCcw size={20} aria-hidden="true" />ล้าง</button></div>
        {stockAction === 'clear' && <DialogDescription className="product-stock-clear-warning"><CircleAlert size={19} aria-hidden="true" />การดำเนินการนี้จะล้างข้อมูลจำนวนสินค้าให้เหลือ 0</DialogDescription>}
        {stockAction !== null && <>{stockAction !== 'clear' && <label className="product-stock-dialog-field">จำนวนที่ต้องการ{stockAction === 'add' ? 'เพิ่ม' : 'ลด'}<Input autoFocus type="number" min="1" inputMode="numeric" value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} placeholder="ระบุจำนวนสินค้า" /></label>}<DialogFooter className="product-stock-dialog-actions"><DialogClose asChild><button type="button" className="admin-secondary-button">ยกเลิก</button></DialogClose><button type="button" className={stockAction === 'clear' ? 'product-stock-confirm-clear' : 'product-stock-confirm'} disabled={stockAction !== 'clear' && (!Number.isFinite(Number(stockQuantity)) || Number(stockQuantity) <= 0)} onClick={confirmStockAction}>ยืนยัน</button></DialogFooter></>}
      </DialogContent>
    </Dialog>
  </section>
}
