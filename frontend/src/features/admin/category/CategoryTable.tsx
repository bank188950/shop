import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { confirmAdminDelete } from '@/lib/confirm-admin-delete'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'
import { getProductCategories, saveProductCategories } from './admin-categories'

export function CategoryTable() {
  const [categories, setCategories] = useState(getProductCategories)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(categories.length / pageSize))
  const visibleCategories = categories.slice((page - 1) * pageSize, page * pageSize)

  async function deleteCategory(categoryId: number, categoryName: string) {
    if (!await confirmAdminDelete(categoryName)) return

    const nextCategories = categories.filter((category) => category.id !== categoryId)
    setCategories(nextCategories)
    setPage((currentPage) => Math.min(currentPage, Math.max(1, Math.ceil(nextCategories.length / pageSize))))
    saveProductCategories(nextCategories)
  }

  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">หมวดสินค้า</h1></div><Link to="/admin/product-categories/add" className="admin-primary-button"><Plus size={19} />เพิ่มหมวดสินค้า</Link></div>
    <div className="product-table-wrap category-table-wrap"><div className="product-table-scroll"><table className="product-table category-table"><thead><tr><th className="table-row-number">ลำดับ</th><th>ชื่อหมวดสินค้า</th><th>จัดการ</th></tr></thead><tbody>{visibleCategories.map((category, index) => <tr key={category.id}><td className="table-row-number">{(page - 1) * pageSize + index + 1}</td><td><strong>{category.name}</strong></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/product-categories/${category.id}/edit`} aria-label={`แก้ไข ${category.name}`}><Pencil size={17} /></Link><button className="product-delete" type="button" aria-label={`ลบ ${category.name} ถาวร`} onClick={() => deleteCategory(category.id, category.name)}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div><AdminTablePagination currentPage={page} totalItems={categories.length} pageSize={pageSize} onPageChange={setPage} label="หมวดสินค้า" /></div>
  </section>
}
