import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { confirmDelete } from '@/components/sweetalert2/confirm-delete'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'
import { useDeleteLocation, useLocations, useSaveLocation } from './hooks/useLocations'

export function LocationTable() {
  const locationsQuery = useLocations()
  const saveMutation = useSaveLocation()
  const deleteMutation = useDeleteLocation()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const locations = locationsQuery.data ?? []
  const visibleLocations = locations.slice((page - 1) * pageSize, page * pageSize)

  async function deleteLocation(locationId: number, locationName: string) {
    if (!await confirmDelete(locationName)) return
    await deleteMutation.mutateAsync(locationId)
    const remainingCount = locations.length - 1
    setPage((currentPage) => Math.min(currentPage, Math.max(1, Math.ceil(remainingCount / pageSize))))
  }

  function toggleLocationActive(locationId: number) {
    const location = locations.find((item) => item.id === locationId)
    if (!location) return
    saveMutation.mutate({ locationId, input: { name: location.name, isActive: !location.isActive } })
  }

  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">สถานที่รับสินค้า</h1></div><Link to="/admin/locations/add" className="admin-primary-button"><Plus size={19} />เพิ่มสถานที่</Link></div>
    <div className="product-table-wrap"><div className="product-table-scroll"><table className="product-table location-table"><thead><tr><th className="table-row-number">ลำดับ</th><th>สถานที่รับสินค้า</th><th>แสดง</th><th>จัดการ</th></tr></thead><tbody>{locationsQuery.isLoading && <tr><td colSpan={4}>กำลังโหลดสถานที่รับสินค้า...</td></tr>}{locationsQuery.isError && <tr><td colSpan={4}>ไม่สามารถโหลดสถานที่รับสินค้าได้: {locationsQuery.error.message}</td></tr>}{!locationsQuery.isLoading && !locationsQuery.isError && visibleLocations.length === 0 && <tr><td colSpan={4}>ยังไม่มีสถานที่รับสินค้า</td></tr>}{visibleLocations.map((location, index) => <tr key={location.id}><td className="table-row-number">{(page - 1) * pageSize + index + 1}</td><td><span className="location-name">{location.name}</span></td><td><button className={`location-status ${location.isActive ? 'is-active' : 'is-inactive'}`} type="button" disabled={saveMutation.isPending} aria-pressed={location.isActive} aria-label={`${location.isActive ? 'ปิด' : 'เปิด'}การแสดง ${location.name}`} title={`${location.isActive ? 'ปิด' : 'เปิด'}การแสดง`} onClick={() => toggleLocationActive(location.id)}>{location.isActive ? <Check size={19} aria-hidden="true" /> : <X size={19} aria-hidden="true" />}</button></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/locations/${location.id}/edit`} aria-label={`แก้ไข ${location.name}`}><Pencil size={17} /></Link><button className="product-delete" type="button" disabled={deleteMutation.isPending} aria-label={`ลบ ${location.name} ถาวร`} onClick={() => deleteLocation(location.id, location.name)}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div><AdminTablePagination currentPage={page} totalItems={locations.length} pageSize={pageSize} onPageChange={setPage} label="สถานที่รับสินค้า" /></div>
  </section>
}
