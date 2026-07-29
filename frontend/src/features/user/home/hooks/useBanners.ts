import { useQuery } from '@tanstack/react-query'
import { getBanners } from '@/api/user/banners'

export const bannerKeys = { list: ['user', 'banners'] as const }

export function useBanners() {
  return useQuery({ queryKey: bannerKeys.list, queryFn: getBanners })
}
