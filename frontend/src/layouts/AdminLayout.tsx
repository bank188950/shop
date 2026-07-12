import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react'

const items = [
  { label: 'ภาพรวม', icon: LayoutDashboard, to: '/admin' },
  { label: 'ออเดอร์', icon: ShoppingBag, to: '/admin/orders' },
  { label: 'สินค้า', icon: Package, to: '/admin/products' },
  { label: 'ลูกค้า', icon: Users, to: '/admin/customers' },
]

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-brand">ลูกชิ้นทอดล้อเลื่อน</p>
        <nav>{items.map(({ icon: Icon, label, to }) => <NavLink key={to} to={to} end={to === '/admin'}><Icon size={18} />{label}</NavLink>)}</nav>
      </aside>
      <main className="admin-content"><Outlet /></main>
    </div>
  )
}
