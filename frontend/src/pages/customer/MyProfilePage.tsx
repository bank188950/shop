import { ChevronLeft, UserCog } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StorefrontFooter } from '@/features/user/shared/StorefrontFooter'
import { StorefrontHeader } from '@/features/user/shared/StorefrontHeader'
import { useCustomerAuth } from '@/features/user/auth/hooks/useCustomerAuth'

export function MyProfilePage() {
  const authQuery = useCustomerAuth()
  const customer = authQuery.data

  return (
    <section className="min-h-screen overflow-hidden">
      <StorefrontHeader />
      <main className="mx-auto w-full max-w-[960px] px-6 py-8 max-md:px-3.5 max-md:py-5">
        <Link to="/" className="mb-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#76503a] px-5 text-xl font-extrabold text-white no-underline shadow-md shadow-[#76503a]/20 transition hover:bg-[#5f3d2b]">
          <ChevronLeft size={22} strokeWidth={2.75} aria-hidden="true" /> กลับหน้าหลัก
        </Link>
        <section className="rounded-[18px] border border-[#b9cbbf] p-5 max-md:p-4" aria-labelledby="profile-heading">
          <h1 id="profile-heading" className="m-0 inline-flex items-center gap-2 font-heading text-[clamp(1.5rem,3vw,2rem)] text-ink">
            <UserCog size={28} strokeWidth={2.5} className="text-brand" aria-hidden="true" />จัดการผู้ใช้
          </h1>
          {authQuery.isLoading && <p className="mt-5 mb-0 text-lg font-bold text-muted">กำลังโหลดข้อมูลผู้ใช้...</p>}
          {!authQuery.isLoading && !customer && <p className="mt-5 mb-0 text-lg font-bold text-muted">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลผู้ใช้</p>}
          {customer && <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5 max-md:grid-cols-1 max-md:gap-y-4">
            <div><dt className="text-xl font-bold text-ink">ชื่อลูกค้า</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">{customer.name}</dd></div>
            <div><dt className="text-xl font-bold text-ink">เบอร์โทรศัพท์</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">{customer.phone}</dd></div>
            <div><dt className="text-xl font-bold text-ink">สถานที่ส่งของ</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">{customer.locationName || 'ยังไม่ได้เลือก'}</dd></div>
            <div><dt className="text-xl font-bold text-ink">LINE ID</dt><dd className="mt-1.5 ml-0 text-lg font-bold text-[#455048]">{customer.lineId || 'ยังไม่ได้ระบุ'}</dd></div>
          </dl>}
        </section>
      </main>
      <StorefrontFooter />
    </section>
  )
}
