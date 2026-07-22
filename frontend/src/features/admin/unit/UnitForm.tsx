import { ArrowLeft, Save } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { getProductUnits, saveProductUnits, type AdminProductUnit } from './admin-units'

export function UnitForm({ unit }: { unit?: AdminProductUnit }) {
  const [name, setName] = useState(unit?.name ?? '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextName = name.trim()
    const units = getProductUnits()
    const hasDuplicateName = units.some((item) => item.id !== unit?.id && item.name === nextName)

    if (hasDuplicateName) {
      setError('มีชื่อหน่วยสินค้านี้แล้ว')
      return
    }

    const nextUnits = unit
      ? units.map((item) => item.id === unit.id ? { ...item, name: nextName } : item)
      : [...units, { id: Date.now(), name: nextName }]
    saveProductUnits(nextUnits)
    setSaved(true)
    window.setTimeout(() => navigate('/admin/product-units'), 400)
  }

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/product-units"><ArrowLeft size={18} aria-hidden="true" />กลับไปหน้าหน่วยสินค้า</Link><h1 className="admin-title">{unit ? 'แก้ไขหน่วยสินค้า' : 'เพิ่มหน่วยสินค้า'}</h1></div></div>
    <form className="product-form-card category-form-card" onSubmit={submit}>
      <label htmlFor="product-unit-name">ชื่อหน่วยสินค้า<Input id="product-unit-name" required value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="เช่น ไม้" aria-describedby={error ? 'product-unit-name-error' : undefined} /></label>
      {error && <p id="product-unit-name-error" className="location-form-error" role="alert">{error}</p>}
      <div className="product-form-actions"><Link to="/admin/product-units" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saved} aria-busy={saved}><Save size={18} aria-hidden="true" />{saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </form>
  </section>
}
