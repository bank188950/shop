import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getAdminBadgeCounts, getDashboardChart, getDashboardSummary } from '@/api/admin/dashboard'
import type { DashboardChartFilters, DashboardFilters } from '@/api/admin/dashboard'

/** แยกออกมาให้ main.tsx สั่งรีเฟรชตัวเลข badge ได้โดยไม่ต้องเขียน key ซ้ำแล้วหลุดจากกัน */
export const adminBadgeCountsKey = ['admin', 'dashboard', 'badge-counts'] as const

const dashboardKeys = {
  summary: (filters: DashboardFilters) => ['admin', 'dashboard', 'summary', filters] as const,
  chart: (filters: DashboardChartFilters) => ['admin', 'dashboard', 'chart', filters] as const,
}

/**
 * ตัวเลขบนไอคอนแถบบน ดึงซ้ำทุก 30 วินาที เพราะคนขายเปิดหน้าจอทิ้งไว้แล้วต้องเห็นออเดอร์ใหม่โดยไม่ต้องรีเฟรช
 * ไม่ดึงตอนแท็บถูกซ่อน เพื่อไม่ให้กินแบตกับเน็ตของเครื่องมือถือ แต่จะดึงทันทีเมื่อกลับมาที่แท็บ
 * ถ้าแอดมินปิดการแจ้งเตือนในหน้าตั้งค่า จะไม่ยิง request เลย ไม่ใช่แค่ซ่อนตัวเลขที่ดึงมาแล้ว
 */
export function useAdminBadgeCounts(isEnabled: boolean) {
  return useQuery({
    queryKey: adminBadgeCountsKey,
    queryFn: getAdminBadgeCounts,
    enabled: isEnabled,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })
}

// คงข้อมูลชุดเดิมไว้ระหว่างเปลี่ยนตัวกรอง การ์ดและกราฟจะได้ไม่กระพริบเป็นค่าว่าง
export function useDashboardSummary(filters: DashboardFilters) {
  return useQuery({ queryKey: dashboardKeys.summary(filters), queryFn: () => getDashboardSummary(filters), placeholderData: keepPreviousData })
}

export function useDashboardChart(filters: DashboardChartFilters) {
  return useQuery({ queryKey: dashboardKeys.chart(filters), queryFn: () => getDashboardChart(filters), placeholderData: keepPreviousData })
}
