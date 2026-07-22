import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminBanners } from '@/features/admin/banner/admin-banners'
import { confirmAdminDelete } from '@/lib/confirm-admin-delete'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'

export function BannerPage() {
  const [banners, setBanners] = useState(adminBanners)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const visibleBanners = banners.slice((page - 1) * pageSize, page * pageSize)

  async function deleteBanner(bannerId: number, bannerTitle: string) {
    if (await confirmAdminDelete(`แบนเนอร์ “${bannerTitle}”`)) setBanners((items) => {
      const nextBanners = items.filter((banner) => banner.id !== bannerId)
      setPage((currentPage) => Math.min(currentPage, Math.max(1, Math.ceil(nextBanners.length / pageSize))))
      return nextBanners
    })
  }

  return <section className="admin-page banner-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">แบนเนอร์</h1></div><Link to="/admin/banners/add" className="admin-primary-button"><Plus size={19} aria-hidden="true" />เพิ่มแบนเนอร์</Link></div>
    <div className="product-table-wrap banner-table-wrap"><div className="product-table-scroll"><table className="product-table banner-table"><thead><tr><th>รูปภาพ</th><th>หัวข้อ</th><th>แสดง</th><th>จัดการ</th></tr></thead><tbody>{visibleBanners.map((banner) => <tr key={banner.id}><td><img className="banner-table-image" src={banner.image} alt={banner.title} /></td><td><strong>{banner.title}</strong></td><td><span className={`product-display-status ${banner.isActive ? 'is-active' : 'is-inactive'}`} aria-label={banner.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} title={banner.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}>{banner.isActive ? <Check size={19} aria-hidden="true" /> : <X size={19} aria-hidden="true" />}</span></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/banners/${banner.id}/edit`} aria-label={`แก้ไขแบนเนอร์ ${banner.title}`}><Pencil size={17} aria-hidden="true" /></Link><button className="product-delete" type="button" onClick={() => deleteBanner(banner.id, banner.title)} aria-label={`ลบแบนเนอร์ ${banner.title}`}><Trash2 size={17} aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div><AdminTablePagination currentPage={page} totalItems={banners.length} pageSize={pageSize} onPageChange={setPage} label="แบนเนอร์" /></div>
  </section>
}
