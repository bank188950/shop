import { ArrowLeft, Save } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { type UnitFieldErrors, validateUnit } from './schema'
import { useSaveUnit, useUnit } from './hooks/useUnits'

export function UnitForm({ unitId }: { unitId?: number }) {
  const unitQuery = useUnit(unitId)
  const saveMutation = useSaveUnit()
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<UnitFieldErrors>({})
  const navigate = useNavigate()

  useEffect(() => {
    if (!unitQuery.data) return
    setName(unitQuery.data.name)
    setIsActive(unitQuery.data.isActive)
  }, [unitQuery.data])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextFieldErrors = validateUnit(name)
    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors)
      setError('')
      return
    }
    try {
      setFieldErrors({})
      setError('')
      await saveMutation.mutateAsync({ unitId, input: { name, isActive } })
      navigate('/admin/product-units')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกหน่วยสินค้าได้')
    }
  }

  if (unitId && unitQuery.isLoading) return <div className="page-message">กำลังโหลดหน่วยสินค้า...</div>
  if (unitId && unitQuery.isError) return <div className="page-message">ไม่สามารถโหลดหน่วยสินค้าได้: {unitQuery.error.message}</div>

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/product-units"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าหน่วยสินค้า</Link><h1 className="admin-title">{unitId ? 'แก้ไขหน่วยสินค้า' : 'เพิ่มหน่วยสินค้า'}</h1></div></div>
    <form className="product-form-card unit-form-card" onSubmit={submit}>
      <label className="unit-form-field" htmlFor="product-unit-name">ชื่อหน่วยสินค้า
        <Input id="product-unit-name" value={name} onChange={(event) => { setName(event.target.value); setError(''); setFieldErrors({}) }} placeholder="เช่น ไม้" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'product-unit-name-error' : undefined} className={fieldErrors.name ? 'product-field-invalid' : undefined} />
        {fieldErrors.name && <span id="product-unit-name-error" className="product-field-error" role="alert">{fieldErrors.name}</span>}
      </label>
      <label className="product-active-toggle"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /><span>เปิดการใช้งาน</span></label>
      {error && <p className="location-form-error" role="alert">{error}</p>}
      <div className="product-form-actions"><Link to="/admin/product-units" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saveMutation.isPending} aria-busy={saveMutation.isPending}><Save size={18} aria-hidden="true" />{saveMutation.isPending ? 'กำลังบันทึก' : 'บันทึก'}</button></div>
    </form>
  </section>
}
