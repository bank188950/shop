import { ImageOff, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { UserProduct } from '@/api/user/products'
import { productStockLabel } from '@/features/user/shared/utils/product-labels'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// children คือปุ่มที่กดแล้วเปิด popup รายละเอียดสินค้า
export function ProductDetailDialog({ product, children }: { product: UserProduct; children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[90dvh] overflow-y-auto sm:max-w-[45rem] border border-[#d8dfd5] bg-white shadow-2xl">
        <DialogClose asChild><Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1 z-10 size-8 rounded-full text-muted hover:bg-[#e1f3e5] hover:text-brand" aria-label="ปิดหน้าต่าง"><X size={18} strokeWidth={2.5} aria-hidden="true" /></Button></DialogClose>
        {product.imageUrl ? <img className="mt-4 aspect-[1.4/1] w-full rounded-lg object-cover" src={product.imageUrl} alt={product.name} /> : <span className="mt-4 grid aspect-[1.4/1] w-full place-items-center rounded-lg bg-[#eef1ec] text-[#9ea49d]"><ImageOff size={40} aria-label="ไม่มีรูปสินค้า" /></span>}
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-ink">{product.name}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-[#455048]">{product.description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between border-t border-[#e2e8e3] pt-4">
          <span className="text-lg font-bold text-muted">{productStockLabel(product)}</span>
          <strong className="font-heading text-2xl text-brand">{product.price.toLocaleString('th-TH')} บาท</strong>
        </div>
      </DialogContent>
    </Dialog>
  )
}
