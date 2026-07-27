import { useParams } from 'react-router-dom'
import { BannerForm } from '@/features/admin/banner/BannerForm'

export function BannerEditPage() {
  const { bannerId } = useParams()
  return <BannerForm bannerId={bannerId ? Number(bannerId) : undefined} />
}
