import { ArrowLeft, CircleAlert, ImagePlus, Minus, Plus, RotateCcw, Save, Settings2 } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { validateProduct } from './schema'
import { useCreateProduct, useProduct, useProductCategories, useProductUnits, useUpdateProduct } from './hooks/useProducts'
import type { ProductFormValues } from './types'

type StockAction = 'add' | 'reduce' | 'clear' | null

const emptyValues: ProductFormValues = {
  name: '', description: '', categoryId: null, unitId: null, salePrice: '', stockPieceCount: '0', piecesPerSale: '1', lowStockThreshold: '5', isActive: true,
}

export function ProductForm({ productId }: { productId?: number }) {
  const productQuery = useProduct(productId)
  const categoriesQuery = useProductCategories()
  const unitsQuery = useProductUnits()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const [values, setValues] = useState<ProductFormValues>(emptyValues)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [stockAction, setStockAction] = useState<StockAction>(null)
  const [stockQuantity, setStockQuantity] = useState('')
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const navigate = useNavigate()
  const isSaving = createMutation.isPending || updateMutation.isPending
  const piecesPerSale = Math.max(1, Number(values.piecesPerSale) || 1)
  const stockQuantityValue = Math.floor((Number(values.stockPieceCount) || 0) / piecesPerSale)
  const selectedUnit = unitsQuery.data?.find((unit) => unit.id === values.unitId)?.name ?? ''

  useEffect(() => {
    const product = productQuery.data
    if (!product) return
    setValues({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      unitId: product.unitId,
      salePrice: String(product.salePrice),
      stockPieceCount: String(product.stockPieceCount),
      piecesPerSale: String(product.piecesPerSale),
      lowStockThreshold: String(product.lowStockThreshold),
      isActive: product.isActive,
    })
    setImagePreview(product.imageUrl)
    setImageFile(null)
  }, [productQuery.data])

  useEffect(() => () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  function selectImage(file: File | undefined) {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('รองรับเฉพาะรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB')
      return
    }
    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function closeStockDialog() {
    setStockAction(null)
    setStockQuantity('')
    setIsStockDialogOpen(false)
  }

  function confirmStockAction() {
    if (!stockAction) return
    if (stockAction === 'clear') {
      setValues((current) => ({ ...current, stockPieceCount: '0' }))
      closeStockDialog()
      return
    }
    const quantity = Number(stockQuantity)
    if (!Number.isInteger(quantity) || quantity <= 0) return
    setValues((current) => {
      const currentPieces = Number(current.stockPieceCount) || 0
      const nextPieces = stockAction === 'add' ? currentPieces + quantity * piecesPerSale : Math.max(0, currentPieces - quantity * piecesPerSale)
      return { ...current, stockPieceCount: String(nextPieces) }
    })
    closeStockDialog()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationMessage = validateProduct(values)
    if (validationMessage) {
      setError(validationMessage)
      return
    }
    setError('')
    try {
      const input = { ...values, image: imageFile }
      if (productId) await updateMutation.mutateAsync({ productId, input })
      else await createMutation.mutateAsync(input)
      navigate('/admin/products')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกสินค้าได้')
    }
  }

  if (productId && productQuery.isLoading) return <div className="page-message">กำลังโหลดสินค้า...</div>
  if (productId && productQuery.isError) return <div className="page-message">ไม่สามารถโหลดสินค้าได้: {productQuery.error.message}</div>

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/products"><ArrowLeft size={18} />กลับไปหน้าสินค้า</Link><h1 className="admin-title">{productId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h1></div></div>
    <form className="product-form-card" onSubmit={submit}>
      <div className="product-form-grid"><label>ชื่อสินค้า<Input required value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} placeholder="เช่น ลูกชิ้นหมูพรีเมียม" /></label><label>หมวดหมู่<Select value={values.categoryId ? String(values.categoryId) : undefined} onValueChange={(value) => setValues((current) => ({ ...current, categoryId: Number(value) }))} disabled={categoriesQuery.isLoading || categoriesQuery.isError}><SelectTrigger aria-label="หมวดหมู่สินค้า" aria-required="true"><SelectValue placeholder={categoriesQuery.isLoading ? 'กำลังโหลดหมวดสินค้า' : 'เลือกหมวดหมู่'} /></SelectTrigger><SelectContent>{categoriesQuery.data?.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent></Select></label></div>
      <div className="product-pricing-grid"><label>ราคา (บาท)<Input type="number" min="0" required value={values.salePrice} onChange={(event) => setValues((current) => ({ ...current, salePrice: event.target.value }))} placeholder="0" /></label><label>จำนวนสินค้า<div className="product-stock-control"><Input className="product-stock-input" type="number" value={stockQuantityValue} disabled aria-label="จำนวนสินค้าปัจจุบัน" /><button type="button" className="product-stock-open-button" onClick={() => setIsStockDialogOpen(true)} aria-label="จัดการจำนวนสินค้า"><Settings2 size={20} aria-hidden="true" /></button></div></label><label>จำนวนชิ้น<Input type="number" min="0" required value={values.stockPieceCount} onChange={(event) => setValues((current) => ({ ...current, stockPieceCount: event.target.value }))} placeholder="0" /></label><label>จำนวนชิ้นต่อ (1 สินค้า)<Input type="number" min="1" required value={values.piecesPerSale} onChange={(event) => setValues((current) => ({ ...current, piecesPerSale: event.target.value }))} placeholder="1" /></label><label>หน่วยสินค้า<Select value={values.unitId ? String(values.unitId) : undefined} onValueChange={(value) => setValues((current) => ({ ...current, unitId: Number(value) }))} disabled={unitsQuery.isLoading || unitsQuery.isError}><SelectTrigger aria-label="หน่วยสินค้า" aria-required="true"><SelectValue placeholder={unitsQuery.isLoading ? 'กำลังโหลดหน่วยสินค้า' : 'เลือกหน่วยสินค้า'} /></SelectTrigger><SelectContent>{unitsQuery.data?.map((unit) => <SelectItem key={unit.id} value={String(unit.id)}>{unit.name}</SelectItem>)}</SelectContent></Select></label><label>แจ้งเตือนสต็อกต่ำ<Input type="number" min="0" required value={values.lowStockThreshold} onChange={(event) => setValues((current) => ({ ...current, lowStockThreshold: event.target.value }))} placeholder="5" /></label></div>
      <label className="product-form-full">รายละเอียดสินค้า<Textarea rows={4} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} placeholder="ระบุขนาด หรือจำนวนต่อไม้" /></label>
      <div className="product-image-upload"><ImagePlus size={27} /><div><strong>อัปโหลดรูปสินค้า</strong><span>รองรับ JPG, PNG, WebP ขนาดไม่เกิน 5 MB</span></div><Input type="file" accept="image/png,image/jpeg,image/webp" aria-label="อัปโหลดรูปสินค้า" onChange={(event) => selectImage(event.target.files?.[0])} /></div>
      {imagePreview && <div className="product-image-preview"><strong>ตัวอย่างรูปสินค้า</strong><img src={imagePreview} alt="ตัวอย่างรูปสินค้า" /></div>}
      <label className="product-active-toggle"><input type="checkbox" checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} /><span>เปิดการใช้งาน</span></label>
      {error && <p className="location-form-error" role="alert">{error}</p>}
      {categoriesQuery.isError && <p className="location-form-error" role="alert">ไม่สามารถโหลดหมวดสินค้าได้: {categoriesQuery.error.message}</p>}
      {unitsQuery.isError && <p className="location-form-error" role="alert">ไม่สามารถโหลดหน่วยสินค้าได้: {unitsQuery.error.message}</p>}
      <div className="product-form-actions"><Link to="/admin/products" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={isSaving || categoriesQuery.isLoading || unitsQuery.isLoading || categoriesQuery.isError || unitsQuery.isError} aria-busy={isSaving}><Save size={18} />{isSaving ? 'กำลังบันทึก' : 'บันทึก'}</button></div>
    </form>

    <Dialog open={isStockDialogOpen} onOpenChange={(open) => { if (!open) closeStockDialog() }}>
      <DialogContent className="product-stock-dialog" showCloseButton={false}>
        <DialogHeader><DialogTitle>{stockAction === null ? 'จัดการจำนวนสินค้า' : stockAction === 'clear' ? 'ล้างสินค้า' : stockAction === 'add' ? 'เพิ่มสินค้า' : 'ลดสินค้า'}</DialogTitle></DialogHeader>
        <p className="product-stock-current">จำนวนสินค้าปัจจุบัน <strong>{stockQuantityValue} {selectedUnit}</strong></p>
        <div className="product-stock-mode-actions" role="group" aria-label="เลือกการจัดการสินค้า"><button type="button" className={stockAction === 'add' ? 'is-selected' : ''} onClick={() => setStockAction('add')}><Plus size={20} aria-hidden="true" />เพิ่ม</button><button type="button" className={stockAction === 'reduce' ? 'is-selected' : ''} onClick={() => setStockAction('reduce')}><Minus size={20} aria-hidden="true" />ลด</button><button type="button" className={`product-stock-clear ${stockAction === 'clear' ? 'is-selected' : ''}`} onClick={() => setStockAction('clear')}><RotateCcw size={20} aria-hidden="true" />ล้าง</button></div>
        {stockAction === 'clear' && <DialogDescription className="product-stock-clear-warning"><CircleAlert size={19} aria-hidden="true" />การดำเนินการนี้จะล้างข้อมูลจำนวนสินค้าให้เหลือ 0</DialogDescription>}
        {stockAction !== null && <>{stockAction !== 'clear' && <label className="product-stock-dialog-field">จำนวนที่ต้องการ{stockAction === 'add' ? 'เพิ่ม' : 'ลด'}<Input autoFocus type="number" min="1" inputMode="numeric" value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} placeholder="ระบุจำนวนสินค้า" /></label>}<DialogFooter className="product-stock-dialog-actions"><DialogClose asChild><button type="button" className="admin-secondary-button">ยกเลิก</button></DialogClose><button type="button" className={stockAction === 'clear' ? 'product-stock-confirm-clear' : 'product-stock-confirm'} disabled={stockAction !== 'clear' && (!Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) <= 0)} onClick={confirmStockAction}>ยืนยัน</button></DialogFooter></>}
      </DialogContent>
    </Dialog>
  </section>
}
