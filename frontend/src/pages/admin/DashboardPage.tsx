import { DashboardSummary } from '@/features/admin/dashboard/DashboardSummary'

export function DashboardPage() {
  return (
    <section>
      <p className="eyebrow">ระบบร้านค้า</p>
      <h1 className="admin-title">แดชบอร์ด</h1>
      <DashboardSummary />
    </section>
  )
}
