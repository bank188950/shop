import { useEffect, useState } from 'react'
import { A11y, Autoplay, EffectFade, Keyboard, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

const heroSlides = [
  { src: '/images/hero-truck-clean-grille.png', alt: 'รถขายลูกชิ้นสีเขียวมุมเฉียง พร้อมกระจังดำเรียบและไม่มีป้ายทะเบียน' },
  { src: '/images/hero-fried-snacks-drinks.png', alt: 'ลูกชิ้นทอด ไส้กรอกทอด น้ำโกโก้เย็น และกาแฟชงบนโต๊ะอาหาร' },
]

export function HeroBanner() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(media.matches)
    updatePreference()
    media.addEventListener('change', updatePreference)
    return () => media.removeEventListener('change', updatePreference)
  }, [])

  return (
    <section className="overflow-hidden rounded-[26px] max-md:rounded-[19px]" aria-label="ภาพบรรยากาศลูกชิ้นทอดล้อเลื่อน">
      <Swiper
        modules={[A11y, Autoplay, EffectFade, Keyboard, Pagination]}
        className="hero-swiper"
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        speed={1000}
        autoplay={prefersReducedMotion ? false : { delay: 7000, disableOnInteraction: false }}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        a11y={{ prevSlideMessage: 'ภาพก่อนหน้า', nextSlideMessage: 'ภาพถัดไป', paginationBulletMessage: 'ไปยังภาพ {{index}}' }}
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.src}>
            <img className="h-[520px] w-full object-cover max-md:h-[260px] max-md:object-[62%_center]" src={slide.src} alt={slide.alt} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
