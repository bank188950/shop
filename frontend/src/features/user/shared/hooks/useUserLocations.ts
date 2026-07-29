import { useQuery } from '@tanstack/react-query'
import { getUserLocations } from '@/api/user/locations'

export const userLocationKey = ['user', 'locations'] as const

export function useUserLocations(enabled = true) {
  return useQuery({ queryKey: userLocationKey, queryFn: getUserLocations, enabled })
}
