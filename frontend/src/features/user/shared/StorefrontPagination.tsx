import { ChevronLeft, ChevronRight } from 'lucide-react'

type StorefrontPaginationProps = {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  label: string
}

// แยก class ของปุ่มปกติกับปุ่มหน้าปัจจุบันให้ไม่มี utility ตัวเดียวกันซ้ำในสตริงเดียว
// ถ้าใส่ทั้ง bg-transparent และ bg-[#0d6b1c] ปนกัน Tailwind จะเลือกตัวที่อยู่หลังในไฟล์ CSS ไม่ใช่ตัวที่เขียนทีหลัง
const baseButtonClassName = 'inline-flex size-11 items-center justify-center rounded-full border text-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-45'
const buttonClassName = `${baseButtonClassName} border-[#c4cec6] bg-transparent text-[#526259] hover:border-[#0d6b1c] hover:text-[#0d6b1c] disabled:hover:border-[#c4cec6] disabled:hover:text-[#526259]`
const activeButtonClassName = `${baseButtonClassName} border-[#0d6b1c] bg-[#0d6b1c] text-white`

export function StorefrontPagination({ currentPage, totalItems, pageSize, onPageChange, label }: StorefrontPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  if (pageCount <= 1) return null

  const firstPage = Math.max(1, Math.min(currentPage - 1, pageCount - 2))
  const pages = Array.from({ length: Math.min(3, pageCount) }, (_, index) => firstPage + index)
  const lastPage = pages[pages.length - 1]
  const items: (number | string)[] = [...pages]
  if (pages[0] > 2) items.unshift('gap-start')
  if (pages[0] > 1) items.unshift(1)
  if (lastPage < pageCount - 1) items.push('gap-end')
  if (lastPage < pageCount) items.push(pageCount)

  return <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
    <p className="m-0 text-base font-bold text-[#68766e]">หน้า {currentPage}/{pageCount} จาก {totalItems} รายการ</p>
    <nav className="flex flex-wrap items-center gap-2" aria-label={`เปลี่ยนหน้า${label}`}>
      <button type="button" className={buttonClassName} aria-label="หน้าก่อนหน้า" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft size={18} strokeWidth={2.5} aria-hidden="true" /></button>
      {items.map((item) => typeof item === 'number'
        ? <button key={item} type="button" className={item === currentPage ? activeButtonClassName : buttonClassName} aria-current={item === currentPage ? 'page' : undefined} onClick={() => onPageChange(item)}>{item}</button>
        : <span key={item} className="px-1 text-lg font-bold text-[#68766e]" aria-hidden="true">…</span>)}
      <button type="button" className={buttonClassName} aria-label="หน้าถัดไป" disabled={currentPage === pageCount} onClick={() => onPageChange(currentPage + 1)}><ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" /></button>
    </nav>
  </div>
}
