import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { HomePage } from '@/pages/customer/HomePage'
import { OrderSummaryPage } from '@/pages/customer/OrderSummaryPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/order-summary" element={<OrderSummaryPage />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="*" element={<div className="page-message">กำลังเตรียมหน้าแอดมิน</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
