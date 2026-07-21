import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getProductCategories, saveProductCategories } from './admin-categories'

export function CategoryTable() {
  const [categories, setCategories] = useState(getProductCategories)

  function deleteCategory(categoryId: number, categoryName: string) {
    if (!window.confirm(`ต้องการลบ ${categoryName} ใช่หรือไม่?`)) return

    const nextCategories = categories.filter((category) => category.id !== categoryId)
    setCategories(nextCategories)
    saveProductCategories(nextCategories)
  }

  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">หมวดสินค้า</h1></div><Link to="/admin/product-categories/add" className="admin-primary-button"><Plus size={19} />เพิ่มหมวดสินค้า</Link></div>
    <div className="product-table-wrap category-table-wrap"><div className="product-table-scroll"><table className="product-table category-table"><thead><tr><th>ชื่อหมวดสินค้า</th><th>จัดการ</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td><strong>{category.name}</strong></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/product-categories/${category.id}/edit`} aria-label={`แก้ไข ${category.name}`}><Pencil size={17} /></Link><button className="product-delete" type="button" aria-label={`ลบ ${category.name} ถาวร`} onClick={() => deleteCategory(category.id, category.name)}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div></div>
  </section>
}
