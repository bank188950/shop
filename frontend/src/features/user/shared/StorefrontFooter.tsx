export function StorefrontFooter() {
  return (
    <footer className="mt-9 grid justify-items-center gap-5 bg-[#0d6b1c] px-6 py-[42px] pb-[50px] text-center text-[#f5f5e8]">
      <a className="inline-flex items-center gap-2.5 text-inherit no-underline" href="#top" aria-label="ลูกชิ้นทอดล้อเลื่อน กลับด้านบน">
        <img className="size-[46px] object-contain" src="/images/logo-white.png" alt="โลโกลูกชิ้นทอดล้อเลื่อน" />
        <strong className="font-heading text-xl">ลูกชิ้นทอดล้อเลื่อน</strong>
      </a>
      <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-lg" aria-label="ข้อมูลรอบจัดส่ง">
        <a className="text-inherit underline decoration-white/55 underline-offset-4 hover:text-white" href="#delivery">จัดส่งช่วงเช้า (08:00–11:00)</a>
        <a className="text-inherit underline decoration-white/55 underline-offset-4 hover:text-white" href="#delivery">จัดส่งช่วงบ่าย (14:00–17:00)</a>
      </nav>
      <p className="m-0 text-lg text-[#c8dfc4]">© 2026 ลูกชิ้นทอดล้อเลื่อน - By Tawatchai</p>
    </footer>
  )
}
