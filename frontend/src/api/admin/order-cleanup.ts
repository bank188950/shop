import api from '@/lib/axios'

export type CleanupPeriod = 'day' | 'month' | 'year'

export type CleanupTarget = {
  period: CleanupPeriod
  /** วันและเดือนเป็นคริสต์ศักราชแบบ ISO ส่วนปีเป็นพุทธศักราชตามที่ dropdown ในหน้าจอใช้ */
  value: string
}

export async function getSlipCleanupCount(target: CleanupTarget) {
  const response = await api.get<{ data: { slipCount: number } }>('/admin/order-cleanup', { params: target })
  return response.data.data.slipCount
}

export async function clearSlipFiles(target: CleanupTarget) {
  const body = new URLSearchParams({ period: target.period, value: target.value })
  const response = await api.post<{ data: { clearedCount: number }, message: string }>('/admin/order-cleanup', body)
  return response.data
}
