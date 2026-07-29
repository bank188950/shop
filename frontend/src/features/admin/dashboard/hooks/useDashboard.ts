import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getDashboardChart, getDashboardSummary } from '@/api/admin/dashboard'
import type { DashboardChartFilters, DashboardFilters } from '@/api/admin/dashboard'

const dashboardKeys = {
  summary: (filters: DashboardFilters) => ['admin', 'dashboard', 'summary', filters] as const,
  chart: (filters: DashboardChartFilters) => ['admin', 'dashboard', 'chart', filters] as const,
}

// คงข้อมูลชุดเดิมไว้ระหว่างเปลี่ยนตัวกรอง การ์ดและกราฟจะได้ไม่กระพริบเป็นค่าว่าง
export function useDashboardSummary(filters: DashboardFilters) {
  return useQuery({ queryKey: dashboardKeys.summary(filters), queryFn: () => getDashboardSummary(filters), placeholderData: keepPreviousData })
}

export function useDashboardChart(filters: DashboardChartFilters) {
  return useQuery({ queryKey: dashboardKeys.chart(filters), queryFn: () => getDashboardChart(filters), placeholderData: keepPreviousData })
}
