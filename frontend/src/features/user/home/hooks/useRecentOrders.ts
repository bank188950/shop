import { useQuery } from '@tanstack/react-query'
import { getRecentOrders } from '@/api/user/recent-orders'

export const recentOrderKeys = { list: ['user', 'recent-orders'] as const }

export function useRecentOrders(enabled = true) {
  return useQuery({ queryKey: recentOrderKeys.list, queryFn: getRecentOrders, enabled, retry: false })
}
