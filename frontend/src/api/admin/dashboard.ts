import api from '@/lib/axios'
import type { AdminDeliveryPeriod, AdminOrderLocation, AdminOrderStatus, AdminPaymentStatus } from '@/api/admin/orders'

export type DashboardFilters = {
  deliveryDate: string
  deliveryPeriod: 'all' | AdminDeliveryPeriod
  locationId: 'all' | number
}

export type DashboardPendingOrder = {
  id: number
  orderNumber: string
  userName: string
  locationName: string
  deliveryPeriod: AdminDeliveryPeriod
  totalAmount: number
  orderStatus: AdminOrderStatus
  paymentStatus: AdminPaymentStatus
}

export type DashboardLocationSummary = {
  locationId: number
  locationName: string
  morning: number
  afternoon: number
  paid: number
  active: number
  salesTotal: number
}

export type DashboardSummary = {
  orderCount: number
  paidOrderCount: number
  paidSalesTotal: number
  activeOrderCount: number
  pendingOrderCount: number
  pendingOrders: DashboardPendingOrder[]
  locationSummary: DashboardLocationSummary[]
}

export type DashboardChartFilters = {
  metric: 'sales' | 'orders'
  range: 'today' | 'week' | 'month'
  /** ปี ค.ศ. ของกราฟรายเดือน */
  year: number
  month: number
  locationId: 'all' | number
}

export type DashboardChart = { labels: string[], values: number[] }

/** ตัวเลขบนไอคอนแถบบน: ออเดอร์รอตรวจสอบของวันนี้ และสินค้าที่สต็อกถึงจุดแจ้งเตือน */
export type AdminBadgeCounts = { newOrders: number, lowStock: number }

export async function getDashboardSummary(filters: DashboardFilters) {
  const params: Record<string, string> = { delivery_date: filters.deliveryDate }
  if (filters.deliveryPeriod !== 'all') params.delivery_period = filters.deliveryPeriod
  if (filters.locationId !== 'all') params.location_id = String(filters.locationId)

  const response = await api.get<{ data: DashboardSummary, locations: AdminOrderLocation[] }>('/admin/dashboard', { params })
  return { summary: response.data.data, locations: response.data.locations }
}

export async function getAdminBadgeCounts() {
  const response = await api.get<{ data: AdminBadgeCounts }>('/admin/dashboard/badge-counts')
  return response.data.data
}

export async function getDashboardChart(filters: DashboardChartFilters) {
  const params: Record<string, string> = {
    metric: filters.metric,
    range: filters.range,
    year: String(filters.year),
    month: String(filters.month),
  }
  if (filters.locationId !== 'all') params.location_id = String(filters.locationId)

  const response = await api.get<{ data: DashboardChart }>('/admin/dashboard/chart', { params })
  return response.data.data
}
