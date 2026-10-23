import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// เก็บชื่อสินค้าไว้ด้วย เพราะถ้าร้านปิดการขายสินค้า API จะไม่ส่งสินค้านั้นมาแล้ว แต่ยังต้องบอกลูกค้าได้ว่านำอะไรออกจากตะกร้า
// ตะกร้าที่บันทึกไว้ก่อนเพิ่มฟิลด์นี้จะไม่มีชื่อ จึงเป็น optional
type CartItem = { productId: number; quantity: number; name?: string }
type CartState = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  setQuantity: (productId: number, quantity: number) => void
  removeItems: (productIds: number[]) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find((cartItem) => cartItem.productId === item.productId)
    return {
      items: existing
        ? state.items.map((cartItem) => cartItem.productId === item.productId ? { ...cartItem, quantity: cartItem.quantity + item.quantity } : cartItem)
        : [...state.items, item],
    }
  }),
  setQuantity: (productId, quantity) => set((state) => ({
    items: quantity > 0
      ? state.items.map((item) => item.productId === productId ? { ...item, quantity } : item)
      : state.items.filter((item) => item.productId !== productId),
  })),
  removeItems: (productIds) => set((state) => ({ items: state.items.filter((item) => !productIds.includes(item.productId)) })),
  clear: () => set({ items: [] }),
}), { name: 'lookchin-cart-v1' }))
