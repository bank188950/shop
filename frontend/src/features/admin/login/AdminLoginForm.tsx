import { Eye, EyeOff, LockKeyhole, Store } from 'lucide-react'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { useAdminAuth, useAdminLogin } from '@/features/admin/auth/hooks/useAdminAuth'
import { adminLoginFormSchema, type AdminLoginFormValues } from '@/features/admin/auth/schema'

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const authQuery = useAdminAuth()
  const loginMutation = useAdminLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginFormValues>({ resolver: zodResolver(adminLoginFormSchema), defaultValues: { username: '', password: '', remember: false } })
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/admin'

  async function signIn(values: AdminLoginFormValues) {
    try {
      await loginMutation.mutateAsync(values)
      navigate(from, { replace: true })
    } catch {
      // แสดงข้อความจาก mutation ด้านล่างของฟอร์ม
    }
  }

  if (authQuery.data) return <Navigate to="/admin" replace />

  return <main className="admin-login-page">
    <section className="admin-login-intro">
      <span className="admin-login-logo"><Store size={37} /></span>
      <h1>Admin Management</h1>
      <p>ลูกชิ้นทอดล้อเลื่อน</p>
    </section>
    <form className="admin-login-card" noValidate onSubmit={handleSubmit(signIn)}>
      <label htmlFor="admin-username">ชื่อผู้ใช้</label>
      <Input id="admin-username" autoComplete="username" aria-invalid={Boolean(errors.username)} {...register('username')} />
      {errors.username && <p className="admin-login-error" role="alert">{errors.username.message}</p>}
      <div className="admin-login-password-row"><label htmlFor="admin-password">รหัสผ่าน</label></div>
      <div className="admin-password-control"><LockKeyhole size={23} /><Input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" aria-invalid={Boolean(errors.password)} {...register('password')} /><button type="button" aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={24} /> : <Eye size={24} />}</button></div>
      {errors.password && <p className="admin-login-error" role="alert">{errors.password.message}</p>}
      <label className="admin-login-remember"><input type="checkbox" {...register('remember')} /><span>จำการเข้าสู่ระบบ</span></label>
      {loginMutation.isError && <p className="admin-login-error" role="alert">{loginMutation.error.message}</p>}
      <button className="admin-login-submit" type="submit" disabled={loginMutation.isPending} aria-busy={loginMutation.isPending}>{loginMutation.isPending ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}</button>
    </form>
  </main>
}
