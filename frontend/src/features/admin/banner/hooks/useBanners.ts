import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminBanner, deleteAdminBanner, getAdminBanner, getAdminBanners, updateAdminBanner } from '@/api/admin/banners'
import type { BannerSaveInput } from '@/api/admin/banners'

const bannerKeys = {
  all: ['admin', 'banners'] as const,
  list: ['admin', 'banners', 'list'] as const,
  detail: (bannerId: number) => ['admin', 'banners', 'detail', bannerId] as const,
}

export function useBanners() {
  return useQuery({ queryKey: bannerKeys.list, queryFn: getAdminBanners })
}

export function useBanner(bannerId?: number) {
  return useQuery({ queryKey: bannerKeys.detail(bannerId ?? 0), queryFn: () => getAdminBanner(bannerId!), enabled: Boolean(bannerId) })
}

export function useSaveBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bannerId, input }: { bannerId?: number, input: BannerSaveInput }) => bannerId ? updateAdminBanner(bannerId, input) : createAdminBanner(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bannerKeys.all }),
  })
}

export function useDeleteBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bannerKeys.all }),
  })
}
