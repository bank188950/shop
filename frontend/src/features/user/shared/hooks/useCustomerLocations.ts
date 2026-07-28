import { useQuery } from '@tanstack/react-query'
import { getCustomerLocations } from '@/api/user/locations'

export const customerLocationKey = ['user', 'locations'] as const

export function useCustomerLocations(enabled = true) {
  return useQuery({ queryKey: customerLocationKey, queryFn: getCustomerLocations, enabled })
}
