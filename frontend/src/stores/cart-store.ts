import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartItem = { productId: number; quantity: number }
type CartState = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  setQuantity: (productId: number, quantity: number) => void
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
  clear: () => set({ items: [] }),
}), { name: 'lookchin-cart-v1' }))
