import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { confirmAdminDelete } from '@/lib/confirm-admin-delete'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'
import { getProductUnits, saveProductUnits } from './admin-units'

export function UnitTable() {
  const [units, setUnits] = useState(getProductUnits)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const visibleUnits = units.slice((page - 1) * pageSize, page * pageSize)

  async function deleteUnit(unitId: number, unitName: string) {
    if (!await confirmAdminDelete(unitName)) return

    const nextUnits = units.filter((unit) => unit.id !== unitId)
    setUnits(nextUnits)
    setPage((currentPage) => Math.min(currentPage, Math.max(1, Math.ceil(nextUnits.length / pageSize))))
    saveProductUnits(nextUnits)
  }

  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">หน่วยสินค้า</h1></div><Link to="/admin/product-units/add" className="admin-primary-button"><Plus size={19} aria-hidden="true" />เพิ่มหน่วยสินค้า</Link></div>
    <div className="product-table-wrap category-table-wrap"><div className="product-table-scroll"><table className="product-table category-table"><thead><tr><th className="table-row-number">ลำดับ</th><th>ชื่อหน่วยสินค้า</th><th>จัดการ</th></tr></thead><tbody>{visibleUnits.map((unit, index) => <tr key={unit.id}><td className="table-row-number">{(page - 1) * pageSize + index + 1}</td><td><strong>{unit.name}</strong></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/product-units/${unit.id}/edit`} aria-label={`แก้ไขหน่วยสินค้า ${unit.name}`}><Pencil size={17} aria-hidden="true" /></Link><button className="product-delete" type="button" aria-label={`ลบหน่วยสินค้า ${unit.name} ถาวร`} onClick={() => deleteUnit(unit.id, unit.name)}><Trash2 size={17} aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div><AdminTablePagination currentPage={page} totalItems={units.length} pageSize={pageSize} onPageChange={setPage} label="หน่วยสินค้า" /></div>
  </section>
}
