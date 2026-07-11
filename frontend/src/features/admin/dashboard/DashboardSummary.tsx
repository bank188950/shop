import { useQuery } from '@tanstack/react-query'
import { api } from '@/libs/api'

export function DashboardSummary() {
  const health = useQuery({ queryKey: ['health'], queryFn: () => api<{ status: string }>('/health') })

  return (
    <div className="admin-cards">
      <article><span>ออเดอร์วันนี้</span><strong>—</strong></article>
      <article><span>ยอดขายวันนี้</span><strong>—</strong></article>
      <article><span>สถานะ API</span><strong>{health.isSuccess ? 'พร้อมใช้งาน' : 'รอเชื่อมต่อ'}</strong></article>
    </div>
  )
}
