import { Check, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { confirmDelete } from '@/components/sweetalert2/confirm-delete'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'
import type { AdminProductCategory } from '@/api/admin/product-categories'
import { useCategories, useDeleteCategory, useMoveCategory, useSaveCategory } from './hooks/useCategories'

export function CategoryTable() {
  const categoriesQuery = useCategories()
  const deleteMutation = useDeleteCategory()
  const saveMutation = useSaveCategory()
  const moveMutation = useMoveCategory()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const categories = categoriesQuery.data ?? []
  const visibleCategories = categories.slice((page - 1) * pageSize, page * pageSize)

  async function toggleActive(category: AdminProductCategory) {
    try {
      await saveMutation.mutateAsync({ categoryId: category.id, input: { name: category.name, tracksQuantity: category.tracksQuantity, isActive: !category.isActive } })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนสถานะการแสดงได้')
    }
  }

  async function deleteCategory(categoryId: number, categoryName: string) {
    if (!await confirmDelete(categoryName)) return
    try {
      await deleteMutation.mutateAsync(categoryId)
      if (visibleCategories.length === 1 && page > 1) setPage((current) => current - 1)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'ไม่สามารถลบหมวดสินค้าได้')
    }
  }

  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">หมวดสินค้า</h1></div><Link to="/admin/product-categories/add" className="admin-primary-button"><Plus size={19} />เพิ่มหมวดสินค้า</Link></div>
    <div className="product-table-wrap category-table-wrap"><div className="product-table-scroll"><table className="product-table category-table"><thead><tr><th className="table-row-number">ลำดับ</th><th>ชื่อหมวดสินค้า</th><th>ระบุจำนวนสินค้า</th><th>จัดลำดับ</th><th className="table-display-column">แสดง</th><th>จัดการ</th></tr></thead><tbody>{categoriesQuery.isLoading && <tr><td colSpan={6}>กำลังโหลดหมวดสินค้า...</td></tr>}{categoriesQuery.isError && <tr><td colSpan={6}>ไม่สามารถโหลดหมวดสินค้าได้: {categoriesQuery.error.message}</td></tr>}{!categoriesQuery.isLoading && !categoriesQuery.isError && visibleCategories.length === 0 && <tr><td colSpan={6}>ยังไม่มีหมวดสินค้า</td></tr>}{visibleCategories.map((category, index) => <tr key={category.id}><td className="table-row-number">{(page - 1) * pageSize + index + 1}</td><td><strong>{category.name}</strong></td><td><span className={`category-quantity-status ${category.tracksQuantity ? 'is-enabled' : 'is-disabled'}`}>{category.tracksQuantity ? 'ระบุ' : 'ไม่ระบุ'}</span></td><td><div className="banner-order-actions"><button type="button" disabled={moveMutation.isPending || category.id === categories[0]?.id} aria-label={`เลื่อน ${category.name} ขึ้น`} onClick={() => moveMutation.mutate({ categoryId: category.id, direction: 'up' })}><ChevronUp size={18} aria-hidden="true" /></button><button type="button" disabled={moveMutation.isPending || category.id === categories[categories.length - 1]?.id} aria-label={`เลื่อน ${category.name} ลง`} onClick={() => moveMutation.mutate({ categoryId: category.id, direction: 'down' })}><ChevronDown size={18} aria-hidden="true" /></button></div></td><td className="table-display-column"><button className={`product-display-status ${category.isActive ? 'is-active' : 'is-inactive'}`} type="button" disabled={saveMutation.isPending} aria-pressed={category.isActive} aria-label={`${category.isActive ? 'ปิด' : 'เปิด'}การแสดง ${category.name}`} onClick={() => toggleActive(category)}>{category.isActive ? <Check size={19} aria-hidden="true" /> : <X size={19} aria-hidden="true" />}</button></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/product-categories/${category.id}/edit`} aria-label={`แก้ไข ${category.name}`}><Pencil size={17} /></Link><button className="product-delete" type="button" disabled={deleteMutation.isPending} aria-label={`ลบ ${category.name} ถาวร`} onClick={() => deleteCategory(category.id, category.name)}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div><AdminTablePagination currentPage={page} totalItems={categories.length} pageSize={pageSize} onPageChange={setPage} label="หมวดสินค้า" /></div>
  </section>
}
