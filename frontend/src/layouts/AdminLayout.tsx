import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Bell, ChevronLeft, ClipboardList, Layers, LayoutDashboard, LogOut, MapPin, Menu, Package, Settings, Store, Truck, UserRound } from 'lucide-react'

const items = [
  { label: 'ภาพรวม', icon: LayoutDashboard, to: '/admin' },
  { label: 'รอบส่งวันนี้', icon: Truck, to: '/admin/dispatches/today' },
  { label: 'ออเดอร์', icon: ClipboardList, to: '/admin/orders' },
  { label: 'สินค้า', icon: Package, to: '/admin/products' },
  { label: 'หมวดสินค้า', icon: Layers, to: '/admin/product-categories' },
  { label: 'สถานที่รับสินค้า', icon: MapPin, to: '/admin/locations' },
  { label: 'ตั้งค่า', icon: Settings, to: '/admin/settings' },
]

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="admin-shell">
      <button type="button" className={`admin-mobile-menu-toggle ${isSidebarOpen ? 'is-open' : ''}`} aria-controls="admin-sidebar" aria-expanded={isSidebarOpen} aria-label={isSidebarOpen ? 'ซ่อนเมนูผู้ดูแล' : 'แสดงเมนูผู้ดูแล'} onClick={() => setIsSidebarOpen((open) => !open)}>{isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}</button>
      <aside id="admin-sidebar" className={`admin-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <NavLink to="/admin" className="admin-brand" aria-label="หน้าหลักระบบแอดมิน" onClick={() => setIsSidebarOpen(false)}><span className="admin-brand-mark"><Store size={23} /></span><span><strong>Admin</strong><small>Management Content</small></span></NavLink>
        <nav>{items.map(({ icon: Icon, label, to }) => <NavLink key={to} to={to} end={to === '/admin'} onClick={() => setIsSidebarOpen(false)}><Icon size={19} />{label}</NavLink>)}</nav>
        <div className="admin-sidebar-bottom"><NavLink to="/admin/login" className="admin-logout" onClick={() => setIsSidebarOpen(false)}><LogOut size={19} />ออกจากระบบ</NavLink></div>
      </aside>
      <div className="admin-main"><header className="admin-topbar"><div className="admin-topbar-actions"><button className="admin-topbar-icon" aria-label="การแจ้งเตือน"><Bell size={20} /></button><NavLink to="/admin/products" className="admin-topbar-icon" aria-label="สินค้าคงคลัง"><Package size={20} /></NavLink></div><span className="admin-topbar-divider" /><div className="admin-profile"><span><strong>Admin Profile</strong><small>ผู้ดูแลระบบ</small></span><span className="admin-avatar"><UserRound size={20} /></span></div></header><main className="admin-content"><Outlet /></main><footer className="admin-footer">© 2026 ลูกชิ้นทอดล้อเลื่อน สงวนลิขสิทธิ์</footer></div>
    </div>
  )
}
