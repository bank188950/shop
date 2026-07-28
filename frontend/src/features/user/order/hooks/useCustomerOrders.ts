import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCustomerOrder, getCustomerOrders, payCustomerOrder } from '@/api/user/orders'
import type { CreateOrderInput } from '@/api/user/orders'
import { getDeliverySettings } from '@/api/user/settings'
import { customerProductKeys } from '@/features/user/shared/hooks/useCustomerProducts'

export const customerOrderKeys = {
  list: ['user', 'orders'] as const,
  deliverySettings: ['user', 'delivery-settings'] as const,
}

export function useCustomerOrders(enabled = true) {
  return useQuery({ queryKey: customerOrderKeys.list, queryFn: getCustomerOrders, enabled, retry: false })
}

export function useDeliverySettings() {
  return useQuery({ queryKey: customerOrderKeys.deliverySettings, queryFn: getDeliverySettings })
}

export function useCreateCustomerOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createCustomerOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerOrderKeys.list })
      queryClient.invalidateQueries({ queryKey: customerProductKeys.list })
    },
  })
}

export function usePayCustomerOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: number) => payCustomerOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerOrderKeys.list }),
  })
}
