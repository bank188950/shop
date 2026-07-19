import { Eye, EyeOff, LockKeyhole, MoveRight, Store } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/admin')
  }

  return <main className="admin-login-page">
    <section className="admin-login-intro">
      <span className="admin-login-logo"><Store size={37} /></span>
      <h1>Admin Portal</h1>
      <p>จัดการออเดอร์และคลังสินค้าได้อย่างง่ายดาย</p>
    </section>
    <form className="admin-login-card" onSubmit={signIn}>
      <label htmlFor="admin-username">ชื่อผู้ใช้</label>
      <input id="admin-username" name="username" defaultValue="admin_user" autoComplete="username" required />
      <div className="admin-login-password-row"><label htmlFor="admin-password">รหัสผ่าน</label><button type="button">ลืมรหัสผ่าน?</button></div>
      <div className="admin-password-control"><LockKeyhole size={23} /><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} defaultValue="password" autoComplete="current-password" required /><button type="button" aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={24} /> : <Eye size={24} />}</button></div>
      <button className="admin-login-submit" type="submit">เข้าสู่ระบบ <MoveRight size={28} /></button>
    </form>
  </main>
}
