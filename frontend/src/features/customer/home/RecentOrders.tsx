import { ChevronLeft, ChevronRight, Table2 } from 'lucide-react'
import { useState } from 'react'

const recentOrders = [
  {
    nickname: 'คุณบอม',
    items: ['ลูกชิ้น 3 ไม้', 'ไส้กรอก 2 ไม้', 'น้ำโกโก้ 2 ขวด'],
    period: 'ช่วงเช้า',
    orderedAt: '04 เม.ย. 2568 08:23',
    status: 'รอชำระเงิน',
  },
  {
    nickname: 'คุณฝน',
    items: ['ลูกชิ้น 2 ไม้', 'ไส้กรอก 1 ไม้', 'กาแฟชง 1 แก้ว'],
    period: 'ช่วงบ่าย',
    orderedAt: '04 เม.ย. 2568 13:01',
    status: 'จ่ายแล้ว',
  },
  {
    nickname: 'คุณต้น',
    items: ['ลูกชิ้น 4 ไม้', 'น้ำโกโก้ 1 ขวด'],
    period: 'ช่วงเช้า',
    orderedAt: '03 เม.ย. 2568 09:15',
    status: 'จ่ายแล้ว',
  },
  {
    nickname: 'คุณแอน',
    items: ['ไส้กรอก 3 ไม้', 'กาแฟชง 2 แก้ว'],
    period: 'ช่วงบ่าย',
    orderedAt: '03 เม.ย. 2568 14:26',
    status: 'รอชำระเงิน',
  },
  {
    nickname: 'คุณกอล์ฟ',
    items: ['ลูกชิ้น 2 ไม้', 'ไส้กรอก 2 ไม้'],
    period: 'ช่วงเช้า',
    orderedAt: '02 เม.ย. 2568 10:04',
    status: 'จ่ายแล้ว',
  },
  {
    nickname: 'คุณนิด',
    items: ['น้ำโกโก้ 2 ขวด', 'กาแฟชง 1 แก้ว'],
    period: 'ช่วงบ่าย',
    orderedAt: '02 เม.ย. 2568 15:12',
    status: 'รอชำระเงิน',
  },
  {
    nickname: 'คุณพีท',
    items: ['ลูกชิ้น 5 ไม้', 'น้ำโกโก้ 1 ขวด'],
    period: 'ช่วงเช้า',
    orderedAt: '01 เม.ย. 2568 08:40',
    status: 'จ่ายแล้ว',
  },
  {
    nickname: 'คุณเมย์',
    items: ['ไส้กรอก 2 ไม้', 'กาแฟชง 1 แก้ว'],
    period: 'ช่วงบ่าย',
    orderedAt: '01 เม.ย. 2568 13:35',
    status: 'จ่ายแล้ว',
  },
  {
    nickname: 'คุณจอย',
    items: ['ลูกชิ้น 3 ไม้', 'ไส้กรอก 1 ไม้'],
    period: 'ช่วงเช้า',
    orderedAt: '31 มี.ค. 2568 09:06',
    status: 'รอชำระเงิน',
  },
  {
    nickname: 'คุณอาร์ต',
    items: ['น้ำโกโก้ 1 ขวด', 'กาแฟชง 2 แก้ว'],
    period: 'ช่วงบ่าย',
    orderedAt: '31 มี.ค. 2568 14:08',
    status: 'จ่ายแล้ว',
  },
  {
    nickname: 'คุณอ้อย',
    items: ['ลูกชิ้น 2 ไม้', 'ไส้กรอก 3 ไม้'],
    period: 'ช่วงเช้า',
    orderedAt: '30 มี.ค. 2568 10:18',
    status: 'จ่ายแล้ว',
  },
  {
    nickname: 'คุณกิ่ง',
    items: ['ลูกชิ้น 1 ไม้', 'น้ำโกโก้ 2 ขวด'],
    period: 'ช่วงบ่าย',
    orderedAt: '30 มี.ค. 2568 15:04',
    status: 'รอชำระเงิน',
  },
]

export function RecentOrders() {
  const [page, setPage] = useState(1)
  const ordersPerPage = 5
  const pageCount = Math.ceil(recentOrders.length / ordersPerPage)
  const pageOrders = recentOrders.slice((page - 1) * ordersPerPage, page * ordersPerPage)

  return (
    <section id="recent-orders" className="mt-10 max-md:mt-7" aria-labelledby="recent-orders-heading">
      <div className="flex items-center gap-3 text-brand max-md:gap-2">
        <Table2 size={30} className="max-md:size-[26px]" aria-hidden="true" />
        <h2 id="recent-orders-heading" className="m-0 font-heading text-[clamp(2rem,4vw,3rem)] leading-tight tracking-[-0.035em] text-[#1d4f29]">รายการสั่งซื้อ</h2>
      </div>
      <div className="mt-5 overflow-x-auto rounded-[18px] border border-[#d8dfd5] bg-white max-md:mt-4" tabIndex={0} aria-label="ตารางรายการสั่งซื้อล่าสุด">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="bg-brand text-white">
            <tr>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">ชื่อเล่น</th>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">รายการที่สั่ง</th>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">ช่วงเวลา</th>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">สั่งเมื่อ</th>
              <th scope="col" className="px-6 py-4 text-lg font-extrabold">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {pageOrders.map((order) => (
              <tr key={`${order.nickname}-${order.orderedAt}`} className="border-t border-[#e5eae2] text-[#26352d]">
                <td className="whitespace-nowrap px-6 py-5 text-xl font-bold">{order.nickname}</td>
                <td className="px-6 py-5"><ul className="m-0 grid list-none gap-1 p-0 text-lg leading-snug">{order.items.map((item) => <li key={item}>{item}</li>)}</ul></td>
                <td className={`whitespace-nowrap px-6 py-5 text-lg font-extrabold ${order.period === 'ช่วงเช้า' ? 'text-[#338ad7]' : 'text-[#c88434]'}`}>{order.period}</td>
                <td className="whitespace-nowrap px-6 py-5 text-lg font-semibold text-[#455a64]">{order.orderedAt}</td>
                <td className="whitespace-nowrap px-6 py-5"><span className={`inline-flex rounded-full px-4 py-1.5 text-lg font-extrabold ${order.status === 'รอชำระเงิน' ? 'bg-[#ffe6e3] text-[#bd3b35]' : 'bg-[#def2e1] text-[#287b3b]'}`}>{order.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className="mt-5 flex items-center justify-between gap-4 max-md:mt-4" aria-label="แบ่งหน้ารายการสั่งซื้อ">
        <p className="m-0 text-lg font-semibold text-[#455a64] max-md:text-base">หน้า {page} จาก {pageCount}</p>
        <div className="flex items-center gap-2" role="list">
          <button type="button" className="grid size-11 place-items-center rounded-full border border-[#cfd8cf] bg-white text-[#455a64] transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40" onClick={() => setPage((current) => current - 1)} disabled={page === 1} aria-label="หน้าก่อนหน้า"><ChevronLeft size={22} /></button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} role="listitem" className={`grid size-11 place-items-center rounded-full border text-lg font-extrabold transition ${page === pageNumber ? 'border-brand bg-brand text-white' : 'border-[#cfd8cf] bg-white text-[#455a64] hover:border-brand hover:text-brand'}`} onClick={() => setPage(pageNumber)} aria-label={`หน้า ${pageNumber}`} aria-current={page === pageNumber ? 'page' : undefined}>{pageNumber}</button>)}
          <button type="button" className="grid size-11 place-items-center rounded-full border border-[#cfd8cf] bg-white text-[#455a64] transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40" onClick={() => setPage((current) => current + 1)} disabled={page === pageCount} aria-label="หน้าถัดไป"><ChevronRight size={22} /></button>
        </div>
      </nav>
    </section>
  )
}
