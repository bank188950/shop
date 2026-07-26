import { HeroBanner } from '@/features/user/home/HeroBanner'
import { ProductCatalog } from '@/features/user/home/ProductCatalog'
import { RecentOrders } from '@/features/user/home/RecentOrders'
import { AnnouncementBar } from '@/features/user/shared/AnnouncementBar'
import { StickyCart } from '@/features/user/shared/StickyCart'
import { StorefrontFooter } from '@/features/user/shared/StorefrontFooter'
import { StorefrontHeader } from '@/features/user/shared/StorefrontHeader'

export function HomePage() {
  return (
    <section className="overflow-hidden pb-32 max-md:pb-28">
      <StorefrontHeader />
      <AnnouncementBar />
      <main id="top" className="mx-auto mt-7 w-full max-w-[1488px] px-6 max-md:mt-3.5 max-md:px-3.5">
        <HeroBanner />
        <RecentOrders />
        <ProductCatalog />
      </main>
      <StorefrontFooter />
      <StickyCart />
    </section>
  )
}
