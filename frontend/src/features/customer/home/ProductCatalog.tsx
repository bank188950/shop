import { Ban, ChefHat, Plus } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { productCategories, products } from '@/features/customer/shared/product-data'

export function ProductCatalog() {
  const [category, setCategory] = useState('ทั้งหมด')
  const addItem = useCartStore((state) => state.addItem)

  return (
    <section id="menu" className="px-1 pt-8 pb-6 max-md:px-0.5 max-md:pt-8" aria-labelledby="menu-heading">
      <div className="flex items-end"><div className="flex items-center gap-3 text-brand max-md:gap-2"><ChefHat size={30} className="max-md:size-[26px]" aria-hidden="true" /><h2 id="menu-heading" className="m-0 font-heading text-[clamp(2rem,4vw,3rem)] leading-tight tracking-[-0.035em] text-[#1d4f29]">เลือกเมนูที่ชอบ</h2></div></div>
      <div className="mt-6 flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:mt-4 max-md:gap-2" role="tablist" aria-label="หมวดสินค้า">
        {productCategories.map((item) => <button type="button" key={item} role="tab" aria-selected={category === item} className={`shrink-0 rounded-full border px-6 py-2 text-lg font-bold transition ${category === item ? 'border-brand bg-brand text-white shadow-md shadow-brand/20' : 'border-[#d5dbd4] bg-canvas text-[#435048] hover:border-brand hover:text-brand'} max-md:px-4`} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <div className="mt-6 grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-md:mt-4 max-md:gap-3">
        {products.map((product) => (
          <article className={`overflow-hidden rounded-[17px] border border-[#d8dfd5] bg-white transition ${product.status === 'sold-out' ? 'bg-[#f4f5f2]' : 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#2d3627]/10'}`} key={product.id}>
            <div className="relative aspect-[1.24/1] overflow-hidden bg-[#eef1ec]"><img className={`size-full object-cover ${product.status === 'sold-out' ? 'grayscale saturate-[.25] opacity-40' : ''}`} src={product.image} alt={product.name} /><span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-base font-extrabold text-white shadow-md ${product.status === 'low-stock' ? 'bg-[#c46b12]' : product.status === 'sold-out' ? 'bg-[#d7443e]' : 'bg-brand'} max-md:right-2 max-md:top-2 max-md:px-2 max-md:py-0.5`}>{product.badge}</span></div>
            <div className={`p-4 max-md:p-3 ${product.status === 'sold-out' ? 'text-[#9ea49d]' : ''}`}><h3 className="m-0 font-heading text-xl leading-tight text-[#26352d] max-md:text-lg">{product.name}</h3><p className={`mt-1 mb-0 text-lg font-extrabold ${product.status === 'low-stock' ? 'text-[#c46b12]' : product.status === 'sold-out' ? 'text-[#d7443e]' : 'text-brand'} max-md:text-base`}>{product.stockLabel}</p><div className="mt-5 flex items-center justify-between"><strong className={`font-heading text-xl ${product.status === 'sold-out' ? 'text-[#9ea49d]' : 'text-[#236f33]'}`}>{product.price.toLocaleString('th-TH')} บาท</strong><button className={`grid size-[42px] place-items-center rounded-full border-0 text-white transition active:scale-95 max-md:size-9 ${product.status === 'sold-out' ? 'cursor-not-allowed bg-[#b7bcb5]' : 'bg-brand hover:bg-brand-dark'}`} type="button" disabled={product.status === 'sold-out'} onClick={() => addItem({ productId: product.id, quantity: 1 })} aria-label={product.status === 'sold-out' ? `${product.name} สินค้าหมด` : `เพิ่ม ${product.name} ลงตะกร้า`}>{product.status === 'sold-out' ? <Ban size={22} /> : <Plus size={22} />}</button></div></div>
          </article>
        ))}
      </div>
    </section>
  )
}
