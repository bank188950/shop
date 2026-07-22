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

  return <div className="product-table-footer"><p>หน้า {currentPage}/{pageCount} จาก {totalItems}</p><nav aria-label={`เปลี่ยนหน้า${label}`}><button type="button" aria-label="หน้าก่อนหน้า" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft size={17} /></button>{pages.map((page) => <button key={page} className={page === currentPage ? 'active' : ''} type="button" aria-current={page === currentPage ? 'page' : undefined} onClick={() => onPageChange(page)}>{page}</button>)}<button type="button" aria-label="หน้าถัดไป" disabled={currentPage === pageCount} onClick={() => onPageChange(currentPage + 1)}><ChevronRight size={17} /></button></nav></div>
}
