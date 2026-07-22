import { useParams } from 'react-router-dom'
import { BannerForm } from '@/features/admin/banner/BannerForm'
import { adminBanners } from '@/features/admin/banner/admin-banners'

export function BannerEditPage() {
  const { bannerId } = useParams()
  const banner = adminBanners.find((item) => item.id === Number(bannerId))
  return <BannerForm banner={banner} />
}
