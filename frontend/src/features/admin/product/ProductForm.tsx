import { ArrowLeft, CircleAlert, ImagePlus, Minus, Plus, RotateCcw, Save, Settings2 } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { type ProductFieldErrors, validateProduct } from './schema'
import { useCreateProduct, useProduct, useProductCategories, useProductUnits, useUpdateProduct } from './hooks/useProducts'
import type { AdminProduct, ProductCategoryOption, ProductFormValues, ProductUnitOption } from './types'

type StockAction = 'add' | 'reduce' | 'clear' | null
type StockField = 'quantity' | 'pieces'

const emptyValues: ProductFormValues = {
  name: '', description: '', categoryId: null, unitId: null, salePrice: '', stockQuantity: '0', stockPieceCount: '0', piecesPerSale: '0', lowStockThreshold: '5', isRecommended: false, isActive: true,
}

function initialValues(product?: AdminProduct): ProductFormValues {
  if (!product) return emptyValues
  return {
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    unitId: product.unitId,
    salePrice: String(product.salePrice),
    stockQuantity: String(product.stockQuantity),
    stockPieceCount: String(product.stockPieceCount),
    piecesPerSale: String(product.piecesPerSale),
    lowStockThreshold: String(product.lowStockThreshold),
    isRecommended: product.isRecommended ?? false,
    isActive: product.isActive,
  }
}

export function ProductForm({ productId }: { productId?: number }) {
  const productQuery = useProduct(productId)
  const categoriesQuery = useProductCategories()
  const unitsQuery = useProductUnits()

  if (productId && productQuery.isLoading) return <div className="page-message">กำลังโหลดสินค้า...</div>
  if (productId && productQuery.isError) return <div className="page-message">ไม่สามารถโหลดสินค้าได้: {productQuery.error.message}</div>
  if (categoriesQuery.isLoading || unitsQuery.isLoading) return <div className="page-message">กำลังโหลดหมวดสินค้าและหน่วยสินค้า...</div>

  return <ProductFormFields
    productId={productId}
    product={productQuery.data}
    categories={categoriesQuery.data ?? []}
    units={unitsQuery.data ?? []}
    categoriesError={categoriesQuery.isError ? categoriesQuery.error.message : ''}
    unitsError={unitsQuery.isError ? unitsQuery.error.message : ''}
  />
}

type ProductFormFieldsProps = {
  productId?: number
  product?: AdminProduct
  categories: ProductCategoryOption[]
  units: ProductUnitOption[]
  categoriesError: string
  unitsError: string
}

function ProductFieldError({ message }: { message?: string }) {
  return message ? <span className="product-field-error" role="alert">{message}</span> : null
}

function ProductFormFields({ productId, product, categories, units, categoriesError, unitsError }: ProductFormFieldsProps) {
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const [values, setValues] = useState<ProductFormValues>(() => initialValues(product))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl ?? null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({})
  const [stockAction, setStockAction] = useState<StockAction>(null)
  const [stockQuantity, setStockQuantity] = useState('')
  const [stockField, setStockField] = useState<StockField>('quantity')
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const navigate = useNavigate()
  const isSaving = createMutation.isPending || updateMutation.isPending
  const selectedUnit = units.find((unit) => unit.id === values.unitId)?.name ?? ''
  const tracksPieceQuantity = categories.find((category) => category.id === values.categoryId)?.tracksPieceQuantity ?? false
  const piecesPerSaleValue = Number(values.piecesPerSale) || 0
  const stockPieceCountValue = Number(values.stockPieceCount) || 0
  const stockFieldLabel = stockField === 'pieces' ? 'จำนวนชิ้น' : 'จำนวนสินค้า'
  const stockQuantityValue = tracksPieceQuantity
    ? (piecesPerSaleValue > 0 ? Math.floor(stockPieceCountValue / piecesPerSaleValue) : 0)
    : Number(values.stockQuantity) || 0

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

  function clearFieldError(field: keyof ProductFieldErrors) {
    setFieldErrors((current) => current[field] ? { ...current, [field]: undefined } : current)
  }

  function selectCategory(categoryId: number) {
    clearFieldError('categoryId')
    setValues((current) => current.categoryId === categoryId
      ? current
      : { ...current, categoryId, stockQuantity: '0', stockPieceCount: '0', piecesPerSale: '0' })
  }

  function openStockDialog(field: StockField) {
    setStockField(field)
    setIsStockDialogOpen(true)
  }

  function closeStockDialog() {
    setStockAction(null)
    setStockQuantity('')
    setIsStockDialogOpen(false)
  }

  function confirmStockAction() {
    if (!stockAction) return
    const field = stockField === 'pieces' ? 'stockPieceCount' : 'stockQuantity'
    clearFieldError(field)
    if (stockAction === 'clear') {
      setValues((current) => ({ ...current, [field]: '0' }))
      closeStockDialog()
      return
    }
    const quantity = Number(stockQuantity)
    if (!Number.isInteger(quantity) || quantity <= 0) return
    setValues((current) => {
      const currentValue = Number(current[field]) || 0
      const nextValue = stockAction === 'add' ? currentValue + quantity : Math.max(0, currentValue - quantity)
      return { ...current, [field]: String(nextValue) }
    })
    closeStockDialog()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextFieldErrors = validateProduct(values, tracksPieceQuantity)
    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors)
      setError('')
      return
    }
    setFieldErrors({})
    setError('')
    try {
      const input = {
        ...values,
        stockQuantity: String(stockQuantityValue),
        stockPieceCount: tracksPieceQuantity ? values.stockPieceCount : '0',
        piecesPerSale: tracksPieceQuantity ? values.piecesPerSale : '0',
        image: imageFile,
      }
      if (productId) await updateMutation.mutateAsync({ productId, input })
      else await createMutation.mutateAsync(input)
      navigate('/admin/products')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกสินค้าได้')
    }
  }

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/products"><ArrowLeft size={18} />กลับไปหน้าสินค้า</Link><h1 className="admin-title">{productId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h1></div></div>
    <form className="product-form-card" onSubmit={submit}>
      <div className="product-form-grid">
        <label>ชื่อสินค้า
          <Input value={values.name} onChange={(event) => { setValues((current) => ({ ...current, name: event.target.value })); clearFieldError('name') }} placeholder="เช่น ลูกชิ้นหมูพรีเมียม" aria-invalid={Boolean(fieldErrors.name)} className={fieldErrors.name ? 'product-field-invalid' : undefined} />
          <ProductFieldError message={fieldErrors.name} />
        </label>
        <label>หมวดหมู่
          <Select value={values.categoryId ? String(values.categoryId) : ''} onValueChange={(value) => selectCategory(Number(value))} disabled={!categories.length}>
            <SelectTrigger aria-label="หมวดหมู่สินค้า" aria-invalid={Boolean(fieldErrors.categoryId)} className={fieldErrors.categoryId ? 'product-field-invalid' : undefined}><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger>
            <SelectContent>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent>
          </Select>
          <ProductFieldError message={fieldErrors.categoryId} />
        </label>
      </div>
      <div className="product-pricing-grid">
        <label>ราคา (บาท)
          <Input type="number" min="0" value={values.salePrice} onChange={(event) => { setValues((current) => ({ ...current, salePrice: event.target.value })); clearFieldError('salePrice') }} placeholder="0" aria-invalid={Boolean(fieldErrors.salePrice)} className={fieldErrors.salePrice ? 'product-field-invalid' : undefined} />
          <ProductFieldError message={fieldErrors.salePrice} />
        </label>
        <label>จำนวนสินค้า
          {tracksPieceQuantity ? <Input type="number" value={stockQuantityValue} readOnly aria-label="จำนวนสินค้า" /> : <div className="product-stock-control"><Input className={`product-stock-input ${fieldErrors.stockQuantity ? 'product-field-invalid' : ''}`} type="number" value={values.stockQuantity} readOnly aria-label="จำนวนสินค้า" aria-invalid={Boolean(fieldErrors.stockQuantity)} /><button type="button" className="product-stock-open-button" onClick={() => openStockDialog('quantity')} aria-label="จัดการจำนวนสินค้า"><Settings2 size={20} aria-hidden="true" /></button></div>}          <ProductFieldError message={fieldErrors.stockQuantity} />
        </label>
        {tracksPieceQuantity && <>
          <label>จำนวนชิ้น
            <div className="product-stock-control"><Input className={`product-stock-input ${fieldErrors.stockPieceCount ? 'product-field-invalid' : ''}`} type="number" value={values.stockPieceCount} readOnly aria-label="จำนวนชิ้น" aria-invalid={Boolean(fieldErrors.stockPieceCount)} /><button type="button" className="product-stock-open-button" onClick={() => openStockDialog('pieces')} aria-label="จัดการจำนวนชิ้น"><Settings2 size={20} aria-hidden="true" /></button></div>
            <ProductFieldError message={fieldErrors.stockPieceCount} />
          </label>
          <label>จำนวนชิ้นต่อ (1 สินค้า)
            <Input type="number" min="0" value={values.piecesPerSale} onChange={(event) => { setValues((current) => ({ ...current, piecesPerSale: event.target.value })); clearFieldError('piecesPerSale') }} placeholder="0" aria-invalid={Boolean(fieldErrors.piecesPerSale)} className={fieldErrors.piecesPerSale ? 'product-field-invalid' : undefined} />
            <ProductFieldError message={fieldErrors.piecesPerSale} />
          </label>
        </>}
        <label>หน่วยสินค้า
          <Select value={values.unitId ? String(values.unitId) : ''} onValueChange={(value) => { setValues((current) => ({ ...current, unitId: Number(value) })); clearFieldError('unitId') }} disabled={!units.length}>
            <SelectTrigger aria-label="หน่วยสินค้า" aria-invalid={Boolean(fieldErrors.unitId)} className={fieldErrors.unitId ? 'product-field-invalid' : undefined}><SelectValue placeholder="เลือกหน่วยสินค้า" /></SelectTrigger>
            <SelectContent>{units.map((unit) => <SelectItem key={unit.id} value={String(unit.id)}>{unit.name}</SelectItem>)}</SelectContent>
          </Select>
          <ProductFieldError message={fieldErrors.unitId} />
        </label>
        <label>แจ้งเตือนสต็อกต่ำ
          <Input type="number" min="0" value={values.lowStockThreshold} onChange={(event) => { setValues((current) => ({ ...current, lowStockThreshold: event.target.value })); clearFieldError('lowStockThreshold') }} placeholder="5" aria-invalid={Boolean(fieldErrors.lowStockThreshold)} className={fieldErrors.lowStockThreshold ? 'product-field-invalid' : undefined} />
          <ProductFieldError message={fieldErrors.lowStockThreshold} />
        </label>
      </div>
      <label className="product-form-full">รายละเอียดสินค้า<Textarea rows={4} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} placeholder="ระบุขนาด หรือจำนวนต่อไม้" /></label>
      <div className="product-image-upload"><ImagePlus size={27} /><div><strong>อัปโหลดรูปสินค้า</strong><span>รองรับ JPG, PNG, WebP ขนาดไม่เกิน 5 MB</span><span className="product-image-size-hint">ขนาดรูป 500 × 500 px</span></div><Input type="file" accept="image/png,image/jpeg,image/webp" aria-label="อัปโหลดรูปสินค้า" onChange={(event) => selectImage(event.target.files?.[0])} /></div>
      {imagePreview && <div className="product-image-preview"><strong>ตัวอย่างรูปสินค้า</strong><img src={imagePreview} alt="ตัวอย่างรูปสินค้า" /></div>}
      <label className="product-active-toggle"><input type="checkbox" checked={values.isRecommended} onChange={(event) => setValues((current) => ({ ...current, isRecommended: event.target.checked }))} /><span>สินค้าแนะนำ</span></label>
      <label className="product-active-toggle"><input type="checkbox" checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} /><span>เปิดการใช้งาน</span></label>
      {error && <p className="location-form-error" role="alert">{error}</p>}
      {categoriesError && <p className="location-form-error" role="alert">ไม่สามารถโหลดหมวดสินค้าได้: {categoriesError}</p>}
      {unitsError && <p className="location-form-error" role="alert">ไม่สามารถโหลดหน่วยสินค้าได้: {unitsError}</p>}
      <div className="product-form-actions"><Link to="/admin/products" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={isSaving || !categories.length || !units.length} aria-busy={isSaving}><Save size={18} />{isSaving ? 'กำลังบันทึก' : 'บันทึก'}</button></div>
    </form>

    <Dialog open={isStockDialogOpen} onOpenChange={(open) => { if (!open) closeStockDialog() }}>
      <DialogContent className="product-stock-dialog" showCloseButton={false}>
        <DialogHeader><DialogTitle>{stockAction === null ? `จัดการ${stockFieldLabel}` : stockAction === 'clear' ? `ล้าง${stockFieldLabel}` : stockAction === 'add' ? `เพิ่ม${stockFieldLabel}` : `ลด${stockFieldLabel}`}</DialogTitle></DialogHeader>
        <p className="product-stock-current">{stockFieldLabel}ปัจจุบัน <strong>{stockField === 'pieces' ? `${stockPieceCountValue} ชิ้น` : `${stockQuantityValue} ${selectedUnit}`}</strong></p>
        <div className="product-stock-mode-actions" role="group" aria-label="เลือกการจัดการสินค้า"><button type="button" className={stockAction === 'add' ? 'is-selected' : ''} onClick={() => setStockAction('add')}><Plus size={20} aria-hidden="true" />เพิ่ม</button><button type="button" className={stockAction === 'reduce' ? 'is-selected' : ''} onClick={() => setStockAction('reduce')}><Minus size={20} aria-hidden="true" />ลด</button><button type="button" className={`product-stock-clear ${stockAction === 'clear' ? 'is-selected' : ''}`} onClick={() => setStockAction('clear')}><RotateCcw size={20} aria-hidden="true" />ล้าง</button></div>
        {stockAction === 'clear' && <DialogDescription className="product-stock-clear-warning"><CircleAlert size={19} aria-hidden="true" />การดำเนินการนี้จะล้างข้อมูล{stockFieldLabel}ให้เหลือ 0</DialogDescription>}
        {stockAction !== null && <>{stockAction !== 'clear' && <label className="product-stock-dialog-field">จำนวนที่ต้องการ{stockAction === 'add' ? 'เพิ่ม' : 'ลด'}<Input autoFocus type="number" min="1" inputMode="numeric" value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} placeholder={`ระบุ${stockFieldLabel}`} /></label>}<DialogFooter className="product-stock-dialog-actions"><DialogClose asChild><button type="button" className="admin-secondary-button">ยกเลิก</button></DialogClose><button type="button" className={stockAction === 'clear' ? 'product-stock-confirm-clear' : 'product-stock-confirm'} disabled={stockAction !== 'clear' && (!Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) <= 0)} onClick={confirmStockAction}>ยืนยัน</button></DialogFooter></>}
      </DialogContent>
    </Dialog>
  </section>
}
