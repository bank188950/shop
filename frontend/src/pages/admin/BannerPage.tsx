import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminBanners } from '@/features/admin/banner/admin-banners'
import { confirmAdminDelete } from '@/lib/confirm-admin-delete'

export function BannerPage() {
  const [banners, setBanners] = useState(adminBanners)

  async function deleteBanner(bannerId: number, bannerTitle: string) {
    if (await confirmAdminDelete(`แบนเนอร์ “${bannerTitle}”`)) setBanners((items) => items.filter((banner) => banner.id !== bannerId))
  }

  return <section className="admin-page banner-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">แบนเนอร์</h1></div><Link to="/admin/banners/add" className="admin-primary-button"><Plus size={19} aria-hidden="true" />เพิ่มแบนเนอร์</Link></div>
    <div className="product-table-wrap banner-table-wrap"><div className="product-table-scroll"><table className="product-table banner-table"><thead><tr><th>รูปภาพ</th><th>หัวข้อ</th><th>แสดง</th><th>จัดการ</th></tr></thead><tbody>{banners.map((banner) => <tr key={banner.id}><td><img className="banner-table-image" src={banner.image} alt={banner.title} /></td><td><strong>{banner.title}</strong></td><td><span className={`product-display-status ${banner.isActive ? 'is-active' : 'is-inactive'}`} aria-label={banner.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} title={banner.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}>{banner.isActive ? <Check size={19} aria-hidden="true" /> : <X size={19} aria-hidden="true" />}</span></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/banners/${banner.id}/edit`} aria-label={`แก้ไขแบนเนอร์ ${banner.title}`}><Pencil size={17} aria-hidden="true" /></Link><button className="product-delete" type="button" onClick={() => deleteBanner(banner.id, banner.title)} aria-label={`ลบแบนเนอร์ ${banner.title}`}><Trash2 size={17} aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div><div className="product-table-footer"><p>ทั้งหมด {banners.length} แบนเนอร์</p></div></div>
  </section>
}
