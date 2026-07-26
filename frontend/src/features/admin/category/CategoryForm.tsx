import { ArrowLeft, Save } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { useCategory, useSaveCategory } from './hooks/useCategories'

export function CategoryForm({ categoryId }: { categoryId?: number }) {
  const categoryQuery = useCategory(categoryId)
  const saveMutation = useSaveCategory()
  const [name, setName] = useState('')
  const [tracksQuantity, setTracksQuantity] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!categoryQuery.data) return
    setName(categoryQuery.data.name)
    setTracksQuantity(categoryQuery.data.tracksQuantity)
    setIsActive(categoryQuery.data.isActive)
  }, [categoryQuery.data])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError('กรุณาระบุชื่อหมวดสินค้า')
      return
    }
    try {
      setError('')
      await saveMutation.mutateAsync({ categoryId, input: { name, tracksQuantity, isActive } })
      navigate('/admin/product-categories')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกหมวดสินค้าได้')
    }
  }

  if (categoryId && categoryQuery.isLoading) return <div className="page-message">กำลังโหลดหมวดสินค้า...</div>
  if (categoryId && categoryQuery.isError) return <div className="page-message">ไม่สามารถโหลดหมวดสินค้าได้: {categoryQuery.error.message}</div>

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/product-categories"><ArrowLeft size={18} />กลับไปหน้าหมวดสินค้า</Link><h1 className="admin-title">{categoryId ? 'แก้ไขหมวดสินค้า' : 'เพิ่มหมวดสินค้า'}</h1></div></div>
    <form className="product-form-card category-form-card" onSubmit={submit}>
      <label htmlFor="category-name">ชื่อหมวดสินค้า<Input id="category-name" required value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="เช่น ลูกชิ้น" aria-describedby={error ? 'category-name-error' : undefined} /></label>
      {error && <p id="category-name-error" className="location-form-error" role="alert">{error}</p>}
      <label className="category-quantity-toggle"><input type="checkbox" checked={tracksQuantity} onChange={(event) => setTracksQuantity(event.target.checked)} /><span>ระบุจำนวนชิ้นต่อ (1 สินค้า)</span></label>
      <label className="product-active-toggle"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /><span>เปิดการใช้งาน</span></label>
      <div className="product-form-actions"><Link to="/admin/product-categories" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saveMutation.isPending} aria-busy={saveMutation.isPending}><Save size={18} aria-hidden="true" />{saveMutation.isPending ? 'กำลังบันทึก' : 'บันทึก'}</button></div>
    </form>
  </section>
}
