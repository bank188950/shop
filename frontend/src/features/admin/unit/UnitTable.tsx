import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { confirmDelete } from '@/components/sweetalert2/confirm-delete'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'
import type { AdminProductUnit } from '@/api/admin/product-units'
import { useDeleteUnit, useSaveUnit, useUnits } from './hooks/useUnits'

export function UnitTable() {
  const unitsQuery = useUnits()
  const deleteMutation = useDeleteUnit()
  const saveMutation = useSaveUnit()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const units = unitsQuery.data ?? []
  const visibleUnits = units.slice((page - 1) * pageSize, page * pageSize)

  async function toggleActive(unit: AdminProductUnit) {
    try {
      await saveMutation.mutateAsync({ unitId: unit.id, input: { name: unit.name, isActive: !unit.isActive } })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนสถานะการแสดงได้')
    }
  }

  async function deleteUnit(unitId: number, unitName: string) {
    if (!await confirmDelete(unitName)) return
    try {
      await deleteMutation.mutateAsync(unitId)
      if (visibleUnits.length === 1 && page > 1) setPage((current) => current - 1)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'ไม่สามารถลบหน่วยสินค้าได้')
    }
  }

  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">หน่วยสินค้า</h1></div><Link to="/admin/product-units/add" className="admin-primary-button"><Plus size={19} aria-hidden="true" />เพิ่มหน่วยสินค้า</Link></div>
    <div className="product-table-wrap category-table-wrap"><div className="product-table-scroll"><table className="product-table category-table"><thead><tr><th className="table-row-number">ลำดับ</th><th>ชื่อหน่วยสินค้า</th><th className="unit-display-column">แสดง</th><th>จัดการ</th></tr></thead><tbody>{unitsQuery.isLoading && <tr><td colSpan={4}>กำลังโหลดหน่วยสินค้า...</td></tr>}{unitsQuery.isError && <tr><td colSpan={4}>ไม่สามารถโหลดหน่วยสินค้าได้: {unitsQuery.error.message}</td></tr>}{!unitsQuery.isLoading && !unitsQuery.isError && visibleUnits.length === 0 && <tr><td colSpan={4}>ยังไม่มีหน่วยสินค้า</td></tr>}{visibleUnits.map((unit, index) => <tr key={unit.id}><td className="table-row-number">{(page - 1) * pageSize + index + 1}</td><td><strong>{unit.name}</strong></td><td className="unit-display-column"><button className={`product-display-status ${unit.isActive ? 'is-active' : 'is-inactive'}`} type="button" disabled={saveMutation.isPending} aria-pressed={unit.isActive} aria-label={`${unit.isActive ? 'ปิด' : 'เปิด'}การแสดง ${unit.name}`} onClick={() => toggleActive(unit)}>{unit.isActive ? <Check size={19} aria-hidden="true" /> : <X size={19} aria-hidden="true" />}</button></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/product-units/${unit.id}/edit`} aria-label={`แก้ไขหน่วยสินค้า ${unit.name}`}><Pencil size={17} aria-hidden="true" /></Link><button className="product-delete" type="button" disabled={deleteMutation.isPending} aria-label={`ลบหน่วยสินค้า ${unit.name} ถาวร`} onClick={() => deleteUnit(unit.id, unit.name)}><Trash2 size={17} aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div><AdminTablePagination currentPage={page} totalItems={units.length} pageSize={pageSize} onPageChange={setPage} label="หน่วยสินค้า" /></div>
  </section>
}
