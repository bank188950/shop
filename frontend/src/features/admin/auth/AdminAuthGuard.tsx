import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from './hooks/useAdminAuth'

export function AdminAuthGuard() {
  const authQuery = useAdminAuth()
  const location = useLocation()

  if (authQuery.isLoading) return <div className="page-message">กำลังตรวจสอบการเข้าสู่ระบบ...</div>
  if (!authQuery.data) return <Navigate to="/admin/login" replace state={{ from: location }} />
  return <Outlet />
}
