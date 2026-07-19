import { DashboardSummary } from '@/features/admin/dashboard/DashboardSummary'

export function DashboardPage() {
  return (
    <section className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-kicker">ภาพรวมร้านค้า</p><h1 className="admin-title">แดชบอร์ด</h1></div><p className="admin-date">อัปเดตล่าสุด วันนี้ 09:30 น.</p></div>
      <DashboardSummary />
    </section>
  )
}
