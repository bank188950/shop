import { useDeliverySettings } from '@/features/user/order/hooks/useUserOrders'
import type { DeliveryPeriodSetting } from '@/api/user/settings'

/** ระหว่างที่ยังโหลดเวลาไม่เสร็จ ให้แสดงแค่ชื่อรอบไปก่อน จะได้ไม่ขึ้นเวลาที่ไม่ตรงกับที่ตั้งไว้ */
const deliveryRangeLabel = (period?: DeliveryPeriodSetting) => period ? ` (${period.deliveryStart}–${period.deliveryEnd})` : ''

export function StorefrontFooter() {
  const settingsQuery = useDeliverySettings()

  return (
    <footer className="mt-9 grid justify-items-center gap-5 bg-[#0d6b1c] px-6 py-[42px] pb-[50px] text-center text-[#f5f5e8]">
      <a className="inline-flex items-center gap-2.5 text-inherit no-underline" href="#top" aria-label="ลูกชิ้นทอดล้อเลื่อน กลับด้านบน">
        <img className="size-[46px] object-contain" src="/images/logo-white.png" alt="โลโกลูกชิ้นทอดล้อเลื่อน" />
        <strong className="font-heading text-xl">ลูกชิ้นทอดล้อเลื่อน</strong>
      </a>
      <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-lg" aria-label="ข้อมูลรอบจัดส่ง">
        <a className="text-inherit underline decoration-white/55 underline-offset-4 hover:text-white" href="#delivery">จัดส่งช่วงเช้า{deliveryRangeLabel(settingsQuery.data?.morning)}</a>
        <a className="text-inherit underline decoration-white/55 underline-offset-4 hover:text-white" href="#delivery">จัดส่งช่วงบ่าย{deliveryRangeLabel(settingsQuery.data?.afternoon)}</a>
      </nav>
      <p className="m-0 text-lg text-[#c8dfc4]">© 2026 ลูกชิ้นทอดล้อเลื่อน - By ล้อเลื่อนกรุ๊ป</p>
    </footer>
  )
}
