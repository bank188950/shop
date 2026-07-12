import { HeroBanner } from '@/features/customer/home/HeroBanner'
import { ProductCatalog } from '@/features/customer/home/ProductCatalog'
import { RecentOrders } from '@/features/customer/home/RecentOrders'
import { AnnouncementBar } from '@/features/customer/shared/AnnouncementBar'
import { StickyCart } from '@/features/customer/shared/StickyCart'
import { StorefrontFooter } from '@/features/customer/shared/StorefrontFooter'
import { StorefrontHeader } from '@/features/customer/shared/StorefrontHeader'

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
