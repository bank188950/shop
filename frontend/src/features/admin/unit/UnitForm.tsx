import { ArrowLeft, Save } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { useSaveUnit, useUnit } from './hooks/useUnits'

export function UnitForm({ unitId }: { unitId?: number }) {
  const unitQuery = useUnit(unitId)
  const saveMutation = useSaveUnit()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (unitQuery.data) setName(unitQuery.data.name)
  }, [unitQuery.data])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError('กรุณาระบุชื่อหน่วยสินค้า')
      return
    }
    try {
      setError('')
      await saveMutation.mutateAsync({ unitId, name })
      navigate('/admin/product-units')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกหน่วยสินค้าได้')
    }
  }

  if (unitId && unitQuery.isLoading) return <div className="page-message">กำลังโหลดหน่วยสินค้า...</div>
  if (unitId && unitQuery.isError) return <div className="page-message">ไม่สามารถโหลดหน่วยสินค้าได้: {unitQuery.error.message}</div>

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/product-units"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าหน่วยสินค้า</Link><h1 className="admin-title">{unitId ? 'แก้ไขหน่วยสินค้า' : 'เพิ่มหน่วยสินค้า'}</h1></div></div>
    <form className="product-form-card category-form-card" onSubmit={submit}>
      <label htmlFor="product-unit-name">ชื่อหน่วยสินค้า<Input id="product-unit-name" required value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="เช่น ไม้" aria-describedby={error ? 'product-unit-name-error' : undefined} /></label>
      {error && <p id="product-unit-name-error" className="location-form-error" role="alert">{error}</p>}
      <div className="product-form-actions"><Link to="/admin/product-units" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saveMutation.isPending} aria-busy={saveMutation.isPending}><Save size={18} aria-hidden="true" />{saveMutation.isPending ? 'กำลังบันทึก' : 'บันทึก'}</button></div>
    </form>
  </section>
}
