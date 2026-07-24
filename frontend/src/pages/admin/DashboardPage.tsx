import { DashboardSummary } from '@/features/admin/dashboard/DashboardSummary'

export function DashboardPage() {
  return (
    <section className="admin-page">
      <div className="admin-page-heading"><div><h1 className="admin-title">แดชบอร์ด</h1></div></div>
      <DashboardSummary />
    </section>
  )
}
