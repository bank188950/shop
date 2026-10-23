import { useEffect } from 'react'
import Swal from 'sweetalert2'
import { swalBaseOptions } from '@/lib/swal'
import { useUserProducts } from '@/features/user/shared/hooks/useUserProducts'
import { useCartStore } from '@/stores/cart-store'

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character] ?? character)

/** sweetalert2 แสดงได้ทีละ popup ถ้ามี popup อื่นเปิดอยู่ เช่น ประกาศจากทางร้าน ให้รอปิดก่อน ไม่อย่างนั้นจะเขียนทับกัน */
async function waitForOpenAlert() {
  while (Swal.isVisible()) await new Promise((resolve) => setTimeout(resolve, 300))
}

/**
 * สินค้าที่ร้านปิดการขายหรืออยู่ในหมวดที่ปิด จะไม่อยู่ใน `/user/products` แล้ว แต่ยังค้างในตะกร้าที่ persist ไว้
 * นำออกจากตะกร้าทันทีที่โหลดรายการสินค้าเสร็จ ตัวเลขในตะกร้าจะได้ตรงกับยอดเงิน แล้วแจ้งลูกค้าว่านำอะไรออกไป
 * เรียกครั้งเดียวใน StorefrontHeader ซึ่งอยู่ทุกหน้าของหน้าร้าน
 */
export function useRemoveUnavailableCartItems() {
  const items = useCartStore((state) => state.items)
  const removeItems = useCartStore((state) => state.removeItems)
  const productsQuery = useUserProducts()

  useEffect(() => {
    if (!productsQuery.isSuccess) return
    const availableIds = new Set(productsQuery.data.map((product) => product.id))
    const unavailable = items.filter((item) => !availableIds.has(item.productId))
    if (!unavailable.length) return

    removeItems(unavailable.map((item) => item.productId))
    const names = unavailable.map((item) => item.name).filter((name): name is string => Boolean(name))
    void waitForOpenAlert().then(() => Swal.fire({
      ...swalBaseOptions,
      icon: 'info',
      title: 'มีสินค้าที่ปิดการขายแล้ว',
      html: names.length
        ? `<p class="m-0">ระบบนำรายการนี้ออกจากตะกร้าให้แล้ว</p><ol class="mt-3 mb-0 inline-block list-decimal pl-7 text-left">${names.map((name) => `<li class="mt-2 first:mt-0">${escapeHtml(name)}</li>`).join('')}</ol>`
        : 'ระบบนำสินค้าที่ปิดการขายออกจากตะกร้าให้แล้ว',
      showCancelButton: false,
      confirmButtonText: 'ตกลง',
    }))
  }, [items, productsQuery.data, productsQuery.isSuccess, removeItems])
}
