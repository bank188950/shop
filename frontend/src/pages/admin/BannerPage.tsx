import { Check, ImageOff, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { confirmDelete } from '@/components/sweetalert2/confirm-delete'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'
import { useBanners, useDeleteBanner, useSaveBanner } from '@/features/admin/banner/hooks/useBanners'

export function BannerPage() {
  const bannersQuery = useBanners()
  const saveMutation = useSaveBanner()
  const deleteMutation = useDeleteBanner()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const banners = bannersQuery.data ?? []
  const visibleBanners = banners.slice((page - 1) * pageSize, page * pageSize)

  async function deleteBanner(bannerId: number, bannerTitle: string) {
    if (!await confirmDelete(`แบนเนอร์ “${bannerTitle}”`)) return
    await deleteMutation.mutateAsync(bannerId)
    const remainingCount = banners.length - 1
    setPage((currentPage) => Math.min(currentPage, Math.max(1, Math.ceil(remainingCount / pageSize))))
  }

  function toggleBannerActive(bannerId: number) {
    const banner = banners.find((item) => item.id === bannerId)
    if (!banner) return
    saveMutation.mutate({ bannerId, input: { title: banner.title, image: null, isActive: !banner.isActive } })
  }

  return <section className="admin-page banner-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">แบนเนอร์</h1></div><Link to="/admin/banners/add" className="admin-primary-button"><Plus size={19} aria-hidden="true" />เพิ่มแบนเนอร์</Link></div>
    <div className="product-table-wrap banner-table-wrap"><div className="product-table-scroll"><table className="product-table banner-table"><thead><tr><th className="table-row-number">ลำดับ</th><th>รูปภาพ</th><th>หัวข้อ</th><th>แสดง</th><th>จัดการ</th></tr></thead><tbody>{bannersQuery.isLoading && <tr><td colSpan={5}>กำลังโหลดแบนเนอร์...</td></tr>}{bannersQuery.isError && <tr><td colSpan={5}>ไม่สามารถโหลดแบนเนอร์ได้: {bannersQuery.error.message}</td></tr>}{!bannersQuery.isLoading && !bannersQuery.isError && visibleBanners.length === 0 && <tr><td colSpan={5}>ยังไม่มีแบนเนอร์</td></tr>}{visibleBanners.map((banner, index) => <tr key={banner.id}><td className="table-row-number">{(page - 1) * pageSize + index + 1}</td><td>{banner.imageUrl ? <img className="banner-table-image" src={banner.imageUrl} alt={banner.title} /> : <div className="banner-image-placeholder" aria-label="ไม่มีรูปแบนเนอร์"><ImageOff size={26} aria-hidden="true" /></div>}</td><td><strong>{banner.title}</strong></td><td><button className={`product-display-status ${banner.isActive ? 'is-active' : 'is-inactive'}`} type="button" disabled={saveMutation.isPending} aria-pressed={banner.isActive} aria-label={`${banner.isActive ? 'ปิด' : 'เปิด'}การแสดง ${banner.title}`} onClick={() => toggleBannerActive(banner.id)}>{banner.isActive ? <Check size={19} aria-hidden="true" /> : <X size={19} aria-hidden="true" />}</button></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/banners/${banner.id}/edit`} aria-label={`แก้ไขแบนเนอร์ ${banner.title}`}><Pencil size={17} aria-hidden="true" /></Link><button className="product-delete" type="button" disabled={deleteMutation.isPending} onClick={() => deleteBanner(banner.id, banner.title)} aria-label={`ลบแบนเนอร์ ${banner.title}`}><Trash2 size={17} aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div><AdminTablePagination currentPage={page} totalItems={banners.length} pageSize={pageSize} onPageChange={setPage} label="แบนเนอร์" /></div>
  </section>
}
