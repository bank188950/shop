import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ChevronLeft, ClipboardList, ClipboardPlus, CookingPot, Eraser, Image, Layers, LayoutDashboard, LogOut, MapPin, Menu, Package, PackageX, Ruler, Settings, Store, Trash2, Truck, UserRound } from 'lucide-react'
import { useAdminOrders } from '@/features/admin/orders/hooks/useAdminOrders'
import { todayIsoDate } from '@/features/admin/orders/utils/order-labels'
import { useProducts } from '@/features/admin/product/hooks/useProducts'
import { useAdminProfile } from '@/features/admin/profile/hooks/useAdminProfile'
import { useAdminLogout } from '@/features/admin/auth/hooks/useAdminAuth'

const items = [
  { label: 'ภาพรวม', icon: LayoutDashboard, to: '/admin' },
  { label: 'ผู้ใช้งาน', icon: UserRound, to: '/admin/users' },
  { label: 'เตรียมสินค้า', icon: CookingPot, to: '/admin/preparations' },
  { label: 'รอบส่งวันนี้', icon: Truck, to: '/admin/dispatches-today' },
  { label: 'รายการสั่งซื้อ', icon: ClipboardList, to: '/admin/orders' },
  { label: 'สินค้า', icon: Package, to: '/admin/products' },
  { label: 'หมวดสินค้า', icon: Layers, to: '/admin/product-categories' },
  { label: 'หน่วยสินค้า', icon: Ruler, to: '/admin/product-units' },
  { label: 'สถานที่รับสินค้า', icon: MapPin, to: '/admin/locations' },
  { label: 'แบนเนอร์', icon: Image, to: '/admin/banners' },
  { label: 'ล้างรายการสั่งซื้อ', icon: Eraser, to: '/admin/order-cleanup' },
  { label: 'ตั้งค่า', icon: Settings, to: '/admin/settings' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  // ตัวเลขบนไอคอนคือรายการสั่งซื้อสถานะ "รอตรวจสอบ" ของวันปัจจุบัน นับรวมทั้งรอบเช้าและรอบบ่าย
  const newOrderFilters = useMemo(() => ({ deliveryDate: todayIsoDate(), deliveryPeriod: 'all' as const, locationId: 'all' as const, orderStatus: 'pending_review' as const, query: '' }), [])
  const newOrderCount = useAdminOrders(newOrderFilters).data?.orders.length ?? 0
  const lowStockCount = useProducts(1, 1).data?.meta.lowStock ?? 0
  const adminProfile = useAdminProfile().data
  const logoutMutation = useAdminLogout()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const isHoverViewport = () => window.matchMedia('(min-width: 1025px)').matches

  useEffect(() => {
    if (!isSidebarOpen) return

    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
    }
  }, [isSidebarOpen])

  useEffect(() => {
    if (!isProfileMenuOpen) return

    const closeProfileMenu = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setIsProfileMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsProfileMenuOpen(false)
    }

    document.addEventListener('mousedown', closeProfileMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeProfileMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isProfileMenuOpen])

  async function signOut() {
    try { await logoutMutation.mutateAsync() } finally { navigate('/admin/login', { replace: true }) }
  }

  return (
    <div className="admin-shell">
      {!isSidebarOpen && <button type="button" className="admin-mobile-menu-toggle" aria-controls="admin-sidebar" aria-expanded={false} aria-label="แสดงเมนูผู้ดูแล" onClick={() => setIsSidebarOpen(true)}><Menu size={22} /></button>}
      <aside id="admin-sidebar" className={`admin-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        {isSidebarOpen && <button type="button" className="admin-sidebar-close" aria-label="ปิดเมนูผู้ดูแล" onClick={() => setIsSidebarOpen(false)}><ChevronLeft size={24} aria-hidden="true" /></button>}
        <NavLink to="/admin" className="admin-brand" aria-label="หน้าหลักระบบแอดมิน" onClick={() => setIsSidebarOpen(false)}><span className="admin-brand-mark"><Store size={23} /></span><span><strong>Admin</strong><small>Management Content</small></span></NavLink>
        <nav>{items.map(({ icon: Icon, label, to }) => <NavLink key={to} to={to} end={to === '/admin'} onClick={() => setIsSidebarOpen(false)}><Icon size={19} />{label}</NavLink>)}</nav>
        <div className="admin-sidebar-bottom"><button type="button" className="admin-logout" disabled={logoutMutation.isPending} onClick={() => { setIsSidebarOpen(false); void signOut() }}><LogOut size={19} />ออกจากระบบ</button></div>
      </aside>
      {isSidebarOpen && <button type="button" className="admin-sidebar-backdrop" aria-label="ปิดเมนูผู้ดูแล" onClick={() => setIsSidebarOpen(false)} />}
      <div className="admin-main"><header className="admin-topbar"><div className="admin-topbar-actions"><NavLink to="/admin/orders" className="admin-topbar-icon" aria-label={`รายการสั่งซื้อใหม่ ${newOrderCount} รายการ`}><ClipboardPlus size={20} aria-hidden="true" />{newOrderCount > 0 && <span className="admin-topbar-badge admin-topbar-badge-new" aria-hidden="true">{newOrderCount}</span>}</NavLink><NavLink to="/admin/products" className="admin-topbar-icon" aria-label={`สินค้าใกล้หมด ${lowStockCount} รายการ`}><PackageX size={20} aria-hidden="true" />{lowStockCount > 0 && <span className="admin-topbar-badge admin-topbar-badge-stock" aria-hidden="true">{lowStockCount}</span>}</NavLink></div><span className="admin-topbar-divider" /><div className="admin-profile" ref={profileMenuRef} onMouseEnter={() => { if (isHoverViewport()) setIsProfileMenuOpen(true) }} onMouseLeave={() => { if (isHoverViewport()) setIsProfileMenuOpen(false) }}><span><strong>{adminProfile?.name ?? 'Admin Profile'}</strong><small>ผู้ดูแลระบบ</small></span><div className="admin-profile-control"><button type="button" className="admin-profile-toggle" aria-label="เปิดเมนูข้อมูลผู้ดูแลระบบ" aria-controls="admin-profile-menu" aria-expanded={isProfileMenuOpen} aria-haspopup="menu" onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}><span className="admin-avatar">{adminProfile?.avatarUrl ? <img src={adminProfile.avatarUrl} alt="รูปผู้ดูแลระบบ" /> : <UserRound size={20} aria-hidden="true" />}</span></button>{isProfileMenuOpen && <div id="admin-profile-menu" className="admin-profile-menu" role="menu"><NavLink to="/admin/profile" role="menuitem" onClick={() => setIsProfileMenuOpen(false)}><UserRound size={19} aria-hidden="true" />ข้อมูลผู้ดูแลระบบ</NavLink></div>}</div></div></header><main className="admin-content"><Outlet /></main><footer className="admin-footer">© 2026 ลูกชิ้นทอดล้อเลื่อน - By Tawatchai</footer></div>
    </div>
  )
}
