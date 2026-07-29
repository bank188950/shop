import { useEffect } from 'react'
import { showNoticePopup } from '@/components/sweetalert2/notice-popup'
import { useAnnouncements } from '@/features/user/shared/hooks/useAnnouncements'
import { HeroBanner } from '@/features/user/home/HeroBanner'
import { ProductCatalog } from '@/features/user/home/ProductCatalog'
import { RecentOrders } from '@/features/user/home/RecentOrders'
import { AnnouncementBar } from '@/features/user/shared/AnnouncementBar'
import { StickyCart } from '@/features/user/shared/StickyCart'
import { StorefrontFooter } from '@/features/user/shared/StorefrontFooter'
import { StorefrontHeader } from '@/features/user/shared/StorefrontHeader'

export function HomePage() {
  // ใช้ query เดียวกับแถบประกาศ จึงไม่มี request เพิ่ม; popup ขึ้นตามสถานะเปิดใช้งาน ต่อให้ยังไม่ได้กรอกข้อความ
  const notice = useAnnouncements().data?.notice
  const isNoticeEnabled = notice?.isEnabled ?? false
  const noticeMessage = notice?.message ?? ''

  useEffect(() => { if (isNoticeEnabled) void showNoticePopup(noticeMessage) }, [isNoticeEnabled, noticeMessage])

  return (
    <section className="overflow-hidden pb-32 max-md:pb-28">
      <StorefrontHeader />
      <AnnouncementBar />
      <main id="top" className="mx-auto mt-7 w-full max-w-[1488px] px-6 max-md:mt-3.5 max-md:px-3.5">
        <HeroBanner />
        <ProductCatalog />
        <RecentOrders />
      </main>
      <StorefrontFooter />
      <StickyCart />
    </section>
  )
}
