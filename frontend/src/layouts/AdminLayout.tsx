import { NavLink, Outlet } from 'react-router-dom'
import { Bell, ChartNoAxesColumnIncreasing, ClipboardList, LayoutDashboard, LogOut, Package, Settings, Store, UserRound } from 'lucide-react'

const items = [
  { label: 'ภาพรวม', icon: LayoutDashboard, to: '/admin' },
  { label: 'สินค้า', icon: Package, to: '/admin/products' },
  { label: 'ออเดอร์', icon: ClipboardList, to: '/admin/orders' },
  { label: 'รายงาน', icon: ChartNoAxesColumnIncreasing, to: '/admin/reports' },
  { label: 'ตั้งค่า', icon: Settings, to: '/admin/settings' },
]

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/admin" className="admin-brand" aria-label="หน้าหลักระบบแอดมิน"><span className="admin-brand-mark"><Store size={23} /></span><span><strong>Admin</strong><small>Management Console</small></span></NavLink>
        <nav>{items.map(({ icon: Icon, label, to }) => <NavLink key={to} to={to} end={to === '/admin'}><Icon size={19} />{label}</NavLink>)}</nav>
        <div className="admin-sidebar-bottom"><NavLink to="/admin/login" className="admin-logout"><LogOut size={19} />ออกจากระบบ</NavLink></div>
      </aside>
      <div className="admin-main"><header className="admin-topbar"><button className="admin-topbar-icon" aria-label="การแจ้งเตือน"><Bell size={20} /></button><span className="admin-topbar-divider" /><div className="admin-profile"><span><strong>Admin Profile</strong><small>ผู้ดูแลระบบ</small></span><span className="admin-avatar"><UserRound size={20} /></span></div></header><main className="admin-content"><Outlet /></main><footer className="admin-footer">© 2026 ลูกชิ้นทอดล้อเลื่อน สงวนลิขสิทธิ์</footer></div>
    </div>
  )
}
