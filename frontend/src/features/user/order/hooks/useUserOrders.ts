import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUserOrder, getUserOrders, payUserOrder } from '@/api/user/orders'
import type { CreateOrderInput } from '@/api/user/orders'
import { getDeliverySettings } from '@/api/user/settings'
import { userProductKeys } from '@/features/user/shared/hooks/useUserProducts'

export const userOrderKeys = {
  list: ['user', 'orders'] as const,
  deliverySettings: ['user', 'delivery-settings'] as const,
}

export function useUserOrders(enabled = true) {
  return useQuery({ queryKey: userOrderKeys.list, queryFn: getUserOrders, enabled, retry: false })
}

export function useDeliverySettings() {
  return useQuery({ queryKey: userOrderKeys.deliverySettings, queryFn: getDeliverySettings })
}

export function useCreateUserOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createUserOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userOrderKeys.list })
      queryClient.invalidateQueries({ queryKey: userProductKeys.list })
    },
  })
}

export function usePayUserOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, slip }: { orderId: number, slip: File }) => payUserOrder(orderId, slip),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userOrderKeys.list }),
  })
}
