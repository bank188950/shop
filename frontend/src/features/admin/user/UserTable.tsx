import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'
import { confirmAdminDelete } from '@/lib/confirm-admin-delete'
import { getAdminUsers, saveAdminUsers } from './admin-users'

export function UserTable() {
  const [users, setUsers] = useState(getAdminUsers)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const visibleUsers = users.slice((page - 1) * pageSize, page * pageSize)

  async function deleteUser(userId: number, userName: string) {
    if (!await confirmAdminDelete(`ผู้ใช้งาน “${userName}”`)) return

    const nextUsers = users.filter((user) => user.id !== userId)
    setUsers(nextUsers)
    setPage((currentPage) => Math.min(currentPage, Math.max(1, Math.ceil(nextUsers.length / pageSize))))
    saveAdminUsers(nextUsers)
  }

  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">ผู้ใช้งาน</h1></div><Link to="/admin/users/add" className="admin-primary-button"><Plus size={19} aria-hidden="true" />เพิ่มผู้ใช้งาน</Link></div>
    <div className="product-table-wrap"><div className="product-table-scroll"><table className="product-table user-table"><thead><tr><th>ชื่อลูกค้า</th><th>เบอร์โทรศัพท์</th><th>LINE ID</th><th>จุดรับสินค้า</th><th>เปิดการใช้งาน</th><th>จัดการ</th></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user.id}><td><strong>{user.name}</strong></td><td className="numeric">{user.phone}</td><td>{user.lineId}</td><td>{user.location}</td><td><span className={`product-display-status ${user.isActive ? 'is-active' : 'is-inactive'}`} aria-label={user.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} title={user.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}>{user.isActive ? <Check size={19} aria-hidden="true" /> : <X size={19} aria-hidden="true" />}</span></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/users/${user.id}/edit`} aria-label={`แก้ไข ${user.name}`}><Pencil size={17} aria-hidden="true" /></Link><button className="product-delete" type="button" aria-label={`ลบ ${user.name}`} onClick={() => deleteUser(user.id, user.name)}><Trash2 size={17} aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div><AdminTablePagination currentPage={page} totalItems={users.length} pageSize={pageSize} onPageChange={setPage} label="ผู้ใช้งาน" /></div>
  </section>
}
