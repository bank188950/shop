import { useEffect, useState } from 'react'
import { A11y, Autoplay, EffectFade, Keyboard, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useBanners } from '@/features/user/home/hooks/useBanners'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

export function HeroBanner() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const bannersQuery = useBanners()
  const banners = bannersQuery.data ?? []

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(media.matches)
    updatePreference()
    media.addEventListener('change', updatePreference)
    return () => media.removeEventListener('change', updatePreference)
  }, [])

  if (!banners.length) return null

  return (
    <section className="overflow-hidden rounded-[26px] max-md:rounded-[19px]" aria-label="ภาพบรรยากาศลูกชิ้นทอดล้อเลื่อน">
      <Swiper
        modules={[A11y, Autoplay, EffectFade, Keyboard, Pagination]}
        className="hero-swiper"
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={banners.length > 1}
        speed={1000}
        autoplay={prefersReducedMotion || banners.length < 2 ? false : { delay: 7000, disableOnInteraction: false }}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        a11y={{ prevSlideMessage: 'ภาพก่อนหน้า', nextSlideMessage: 'ภาพถัดไป', paginationBulletMessage: 'ไปยังภาพ {{index}}' }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <img className="h-[520px] w-full object-cover max-md:h-[260px] max-md:object-[62%_center]" src={banner.imageUrl} alt={banner.title} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
