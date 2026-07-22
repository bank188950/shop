import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, ClipboardPlus, Flame, Image, Layers, LayoutDashboard, LogOut, MapPin, Menu, Package, PackageX, Ruler, Settings, Store, Truck, UserRound } from 'lucide-react'
import { mockOrders } from '@/features/admin/orders/order-data'
import { adminProducts } from '@/features/admin/product/admin-products'

const items = [
  { label: 'ภาพรวม', icon: LayoutDashboard, to: '/admin' },
  { label: 'รอบส่งวันนี้', icon: Truck, to: '/admin/dispatches-today' },
  { label: 'รายการสั่งซื้อ', icon: ClipboardList, to: '/admin/orders' },
  { label: 'เตรียมของ', icon: Flame, to: '/admin/preparations' },
  { label: 'ผู้ใช้งาน', icon: UserRound, to: '/admin/users' },
  { label: 'สินค้า', icon: Package, to: '/admin/products' },
  { label: 'หมวดสินค้า', icon: Layers, to: '/admin/product-categories' },
  { label: 'หน่วยสินค้า', icon: Ruler, to: '/admin/product-units' },
  { label: 'สถานที่รับสินค้า', icon: MapPin, to: '/admin/locations' },
  { label: 'แบนเนอร์', icon: Image, to: '/admin/banners' },
  { label: 'ตั้งค่า', icon: Settings, to: '/admin/settings' },
]

const newOrderCount = mockOrders.filter((order) => order.status === 'รอตรวจสอบ').length
const lowStockCount = adminProducts.filter((product) => product.status === 'สต็อกต่ำ').length

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="admin-shell">
      <button type="button" className="admin-mobile-menu-toggle" aria-controls="admin-sidebar" aria-expanded={isSidebarOpen} aria-label={isSidebarOpen ? 'ซ่อนเมนูผู้ดูแล' : 'แสดงเมนูผู้ดูแล'} onClick={() => setIsSidebarOpen((open) => !open)}><Menu size={22} /></button>
      <aside id="admin-sidebar" className={`admin-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <NavLink to="/admin" className="admin-brand" aria-label="หน้าหลักระบบแอดมิน" onClick={() => setIsSidebarOpen(false)}><span className="admin-brand-mark"><Store size={23} /></span><span><strong>Admin</strong><small>Management Content</small></span></NavLink>
        <nav>{items.map(({ icon: Icon, label, to }) => <NavLink key={to} to={to} end={to === '/admin'} onClick={() => setIsSidebarOpen(false)}><Icon size={19} />{label}</NavLink>)}</nav>
        <div className="admin-sidebar-bottom"><NavLink to="/admin/login" className="admin-logout" onClick={() => setIsSidebarOpen(false)}><LogOut size={19} />ออกจากระบบ</NavLink></div>
      </aside>
      {isSidebarOpen && <button type="button" className="admin-sidebar-backdrop" aria-label="ปิดเมนูผู้ดูแล" onClick={() => setIsSidebarOpen(false)} />}
      <div className="admin-main"><header className="admin-topbar"><div className="admin-topbar-actions"><NavLink to="/admin/orders" className="admin-topbar-icon" aria-label={`รายการสั่งซื้อใหม่ ${newOrderCount} รายการ`}><ClipboardPlus size={20} aria-hidden="true" />{newOrderCount > 0 && <span className="admin-topbar-badge admin-topbar-badge-new" aria-hidden="true">{newOrderCount}</span>}</NavLink><NavLink to="/admin/products" className="admin-topbar-icon" aria-label={`สินค้าใกล้หมด ${lowStockCount} รายการ`}><PackageX size={20} aria-hidden="true" />{lowStockCount > 0 && <span className="admin-topbar-badge admin-topbar-badge-stock" aria-hidden="true">{lowStockCount}</span>}</NavLink></div><span className="admin-topbar-divider" /><div className="admin-profile"><span><strong>Admin Profile</strong><small>ผู้ดูแลระบบ</small></span><span className="admin-avatar"><UserRound size={20} /></span></div></header><main className="admin-content"><Outlet /></main><footer className="admin-footer">© 2026 ลูกชิ้นทอดล้อเลื่อน สงวนลิขสิทธิ์</footer></div>
    </div>
  )
}
