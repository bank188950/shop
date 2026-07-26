import { ChevronLeft, ChevronRight } from 'lucide-react'

type AdminTablePaginationProps = {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  label: string
}

export function AdminTablePagination({ currentPage, totalItems, pageSize, onPageChange, label }: AdminTablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const firstPage = Math.max(1, Math.min(currentPage - 1, pageCount - 2))
  const pages = Array.from({ length: Math.min(3, pageCount) }, (_, index) => firstPage + index)
  const lastPage = pages[pages.length - 1]
  const items: (number | string)[] = [...pages]
  if (pages[0] > 2) items.unshift('gap-start')
  if (pages[0] > 1) items.unshift(1)
  if (lastPage < pageCount - 1) items.push('gap-end')
  if (lastPage < pageCount) items.push(pageCount)

  return <div className="product-table-footer"><p>หน้า {currentPage}/{pageCount} จาก {totalItems}</p><nav aria-label={`เปลี่ยนหน้า${label}`}><button type="button" aria-label="หน้าก่อนหน้า" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft size={17} /></button>{items.map((item) => typeof item === 'number' ? <button key={item} className={item === currentPage ? 'active' : ''} type="button" aria-current={item === currentPage ? 'page' : undefined} onClick={() => onPageChange(item)}>{item}</button> : <span key={item} className="table-page-gap" aria-hidden="true">…</span>)}<button type="button" aria-label="หน้าถัดไป" disabled={currentPage === pageCount} onClick={() => onPageChange(currentPage + 1)}><ChevronRight size={17} /></button></nav></div>
}
