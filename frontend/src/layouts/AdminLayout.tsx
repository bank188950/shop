import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ChevronLeft, ClipboardList, ClipboardPlus, CookingPot, Eraser, Image, Layers, LayoutDashboard, LogOut, MapPin, Menu, Package, PackageX, Ruler, Settings, Store, Ticket, Trash2, Truck, UserRound } from 'lucide-react'
import { useAdminBadgeCounts, useSlipQuota } from '@/features/admin/dashboard/hooks/useDashboard'
import { useSettings } from '@/features/admin/settings/hooks/useSettings'
import { badgeCountLabel } from '@/utils/badge-count'
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
  { label: 'ล้างไฟล์สลิป', icon: Eraser, to: '/admin/order-cleanup' },
  { label: 'ตั้งค่า', icon: Settings, to: '/admin/settings' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  // ตัวเลขบนไอคอนคือรายการสั่งซื้อสถานะ "รอตรวจสอบ" ของวันปัจจุบัน นับรวมทั้งรอบเช้าและรอบบ่าย และสินค้าที่สต็อกถึงจุดแจ้งเตือน
  // รอให้รู้ค่าจากหน้าตั้งค่าก่อนค่อยเริ่มดึง จะได้ไม่ยิง request ทิ้งไปรอบหนึ่งตอนที่แอดมินปิดการแจ้งเตือนไว้
  const adminSettings = useSettings().data
  const isBadgeEnabled = adminSettings?.isBadgeNotificationEnabled ?? false
  // โควตาตรวจสลิปแยกสวิตช์กับ badge ออเดอร์และสินค้า เพราะเป็นเรื่องของระบบตรวจสลิปไม่ใช่ยอดขาย
  const isSlipQuotaAlertEnabled = adminSettings?.isSlipQuotaAlertEnabled ?? false
  const slipQuota = useSlipQuota(isSlipQuotaAlertEnabled).data
  // โชว์ตัวเลขตลอดเมื่อเปิดสวิตช์ แล้วเปลี่ยนเป็นสีแดงเมื่อใกล้หมด ให้เหมือนไอคอนออเดอร์ใหม่และสินค้าใกล้หมดที่โชว์ตัวเลขอยู่เสมอ
  const isSlipQuotaVisible = isSlipQuotaAlertEnabled && Boolean(slipQuota)
  const isSlipQuotaAlert = isSlipQuotaVisible && (!slipQuota!.isAvailable || slipQuota!.isLow)
  const badgeCounts = useAdminBadgeCounts(isBadgeEnabled).data
  const newOrderCount = isBadgeEnabled ? badgeCounts?.newOrders ?? 0 : 0
  const lowStockCount = isBadgeEnabled ? badgeCounts?.lowStock ?? 0 : 0
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
      <div className="admin-main"><header className="admin-topbar"><div className="admin-topbar-actions"><NavLink to="/admin/orders" className="admin-topbar-icon" aria-label={isBadgeEnabled ? `รายการสั่งซื้อใหม่ ${newOrderCount} รายการ` : 'รายการสั่งซื้อ'}><ClipboardPlus size={20} aria-hidden="true" />{newOrderCount > 0 && <span className="admin-topbar-badge admin-topbar-badge-new" aria-hidden="true">{badgeCountLabel(newOrderCount)}</span>}</NavLink><NavLink to="/admin/products" className="admin-topbar-icon" aria-label={isBadgeEnabled ? `สินค้าใกล้หมด ${lowStockCount} รายการ` : 'สินค้า'}><PackageX size={20} aria-hidden="true" />{lowStockCount > 0 && <span className="admin-topbar-badge admin-topbar-badge-stock" aria-hidden="true">{badgeCountLabel(lowStockCount)}</span>}</NavLink><NavLink to="/admin/settings" className="admin-topbar-icon" aria-label={!isSlipQuotaVisible ? 'โควตาตรวจสลิป' : slipQuota!.isAvailable ? `โควตาตรวจสลิปเหลือ ${slipQuota!.slipRemaining} สลิป` : 'ไม่สามารถเชื่อมต่อระบบตรวจสลิปได้'}><Ticket size={20} aria-hidden="true" />{isSlipQuotaVisible && <span className={`admin-topbar-badge ${isSlipQuotaAlert ? 'admin-topbar-badge-slip' : 'admin-topbar-badge-stock'}`} aria-hidden="true">{slipQuota!.isAvailable ? String(slipQuota!.slipRemaining) : '!'}</span>}</NavLink></div><span className="admin-topbar-divider" /><div className="admin-profile" ref={profileMenuRef} onMouseEnter={() => { if (isHoverViewport()) setIsProfileMenuOpen(true) }} onMouseLeave={() => { if (isHoverViewport()) setIsProfileMenuOpen(false) }}><span><strong>{adminProfile?.name ?? 'Admin Profile'}</strong><small>ผู้ดูแลระบบ</small></span><div className="admin-profile-control"><button type="button" className="admin-profile-toggle" aria-label="เปิดเมนูข้อมูลผู้ดูแลระบบ" aria-controls="admin-profile-menu" aria-expanded={isProfileMenuOpen} aria-haspopup="menu" onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}><span className="admin-avatar">{adminProfile?.avatarUrl ? <img src={adminProfile.avatarUrl} alt="รูปผู้ดูแลระบบ" /> : <UserRound size={20} aria-hidden="true" />}</span></button>{isProfileMenuOpen && <div id="admin-profile-menu" className="admin-profile-menu" role="menu"><NavLink to="/admin/profile" role="menuitem" onClick={() => setIsProfileMenuOpen(false)}><UserRound size={19} aria-hidden="true" />ข้อมูลผู้ดูแลระบบ</NavLink></div>}</div></div></header><main className="admin-content"><Outlet /></main><footer className="admin-footer">© 2026 ลูกชิ้นทอดล้อเลื่อน - By ล้อเลื่อนกรุ๊ป</footer></div>
    </div>
  )
}
