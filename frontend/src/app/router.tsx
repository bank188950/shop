import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { HomePage } from '@/pages/customer/HomePage'
import { OrderSummaryPage } from '@/pages/customer/OrderSummaryPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { ProductPage } from '@/pages/admin/ProductPage'
import { ProductInsertPage } from '@/pages/admin/ProductInsertPage'
import { ProductEditPage } from '@/pages/admin/ProductEditPage'
import { OrderPage } from '@/pages/admin/OrderPage'
import { OrderDetailPage } from '@/pages/admin/OrderDetailPage'
import { DispatchTodayPage } from '@/pages/admin/DispatchTodayPage'
import { SettingsPage } from '@/pages/admin/SettingsPage'
import { BannerPage } from '@/pages/admin/BannerPage'
import { BannerInsertPage } from '@/pages/admin/BannerInsertPage'
import { BannerEditPage } from '@/pages/admin/BannerEditPage'
import { MyOrdersPage } from '@/pages/customer/MyOrdersPage'
import { LocationPage } from '@/pages/admin/LocationPage'
import { LocationFormPage } from '@/pages/admin/LocationFormPage'
import { ProductCategoryPage } from '@/pages/admin/ProductCategoryPage'
import { ProductCategoryFormPage } from '@/pages/admin/ProductCategoryFormPage'
import { UserFormPage } from '@/pages/admin/UserFormPage'
import { UserPage } from '@/pages/admin/UserPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/order-summary" element={<OrderSummaryPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="products/add" element={<ProductInsertPage />} />
          <Route path="products/:productId/edit" element={<ProductEditPage />} />
          <Route path="product-categories" element={<ProductCategoryPage />} />
          <Route path="product-categories/add" element={<ProductCategoryFormPage />} />
          <Route path="product-categories/:categoryId/edit" element={<ProductCategoryFormPage />} />
          <Route path="locations" element={<LocationPage />} />
          <Route path="locations/add" element={<LocationFormPage />} />
          <Route path="locations/:locationId/edit" element={<LocationFormPage />} />
          <Route path="orders" element={<OrderPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="users" element={<UserPage />} />
          <Route path="users/add" element={<UserFormPage />} />
          <Route path="users/:userId/edit" element={<UserFormPage />} />
          <Route path="dispatches-today" element={<DispatchTodayPage />} />
          <Route path="banners" element={<BannerPage />} />
          <Route path="banners/add" element={<BannerInsertPage />} />
          <Route path="banners/:bannerId/edit" element={<BannerEditPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<div className="page-message">กำลังเตรียมหน้านี้</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
