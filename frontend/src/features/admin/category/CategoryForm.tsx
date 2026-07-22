import { ArrowLeft, Save } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { getProductCategories, saveProductCategories, type AdminProductCategory } from './admin-categories'

export function CategoryForm({ category }: { category?: AdminProductCategory }) {
  const [name, setName] = useState(category?.name ?? '')
  const [tracksQuantity, setTracksQuantity] = useState(category?.tracksQuantity ?? false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextName = name.trim()
    const categories = getProductCategories()
    const hasDuplicateName = categories.some((item) => item.id !== category?.id && item.name === nextName)

    if (hasDuplicateName) {
      setError('มีชื่อหมวดสินค้านี้แล้ว')
      return
    }

    const nextCategories = category
      ? categories.map((item) => item.id === category.id ? { ...item, name: nextName, tracksQuantity } : item)
      : [...categories, { id: Date.now(), name: nextName, tracksQuantity }]
    saveProductCategories(nextCategories)
    setSaved(true)
    window.setTimeout(() => navigate('/admin/product-categories'), 400)
  }

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/product-categories"><ArrowLeft size={18} />กลับไปหน้าหมวดสินค้า</Link><h1 className="admin-title">{category ? 'แก้ไขหมวดสินค้า' : 'เพิ่มหมวดสินค้า'}</h1></div></div>
    <form className="product-form-card category-form-card" onSubmit={submit}>
      <label htmlFor="category-name">ชื่อหมวดสินค้า<Input id="category-name" required value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="เช่น ลูกชิ้น" aria-describedby={error ? 'category-name-error' : undefined} /></label>
      {error && <p id="category-name-error" className="location-form-error" role="alert">{error}</p>}
      <label className="category-quantity-toggle"><input type="checkbox" checked={tracksQuantity} onChange={(event) => setTracksQuantity(event.target.checked)} /><span>ระบุจำนวนชิ้นต่อ (1 สินค้า)</span></label>
      <div className="product-form-actions"><Link to="/admin/product-categories" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saved} aria-busy={saved}><Save size={18} aria-hidden="true" />{saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </form>
  </section>
}
