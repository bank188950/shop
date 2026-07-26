export type AdminBanner = {
  id: number
  title: string
  image: string
  isActive: boolean
}

export const adminBanners: AdminBanner[] = [
  { id: 1, title: 'เมนูอร่อยพร้อมเสิร์ฟทุกวัน', image: '/images/hero-truck-clean-grille.png', isActive: true },
  { id: 2, title: 'ของทอดและเครื่องดื่มสดชื่น', image: '/images/hero-fried-snacks-drinks.png', isActive: true },
]
