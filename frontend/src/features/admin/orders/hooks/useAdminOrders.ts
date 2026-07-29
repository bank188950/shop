import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminOrder, getAdminOrders, updateAdminOrderStatus, updateAdminOrdersStatus } from '@/api/admin/orders'
import type { AdminOrderFilters, AdminOrderStatus, AdminOrderStatusInput } from '@/api/admin/orders'

const orderKeys = {
  all: ['admin', 'orders'] as const,
  list: (filters: AdminOrderFilters) => ['admin', 'orders', 'list', filters] as const,
  detail: (orderId: number) => ['admin', 'orders', 'detail', orderId] as const,
}

export function useAdminOrders(filters: AdminOrderFilters) {
  // คงข้อมูลหน้าเดิมไว้ระหว่างเปลี่ยนตัวกรอง ตารางจะได้ไม่กระพริบเป็นค่าว่าง
  return useQuery({ queryKey: orderKeys.list(filters), queryFn: () => getAdminOrders(filters), placeholderData: keepPreviousData })
}

export function useAdminOrder(orderId?: number) {
  return useQuery({ queryKey: orderKeys.detail(orderId ?? 0), queryFn: () => getAdminOrder(orderId!), enabled: Boolean(orderId) })
}

export function useUpdateAdminOrdersStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderIds, orderStatus }: { orderIds: number[], orderStatus: AdminOrderStatus }) => updateAdminOrdersStatus(orderIds, orderStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}

export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: number, input: AdminOrderStatusInput }) => updateAdminOrderStatus(orderId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
