import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartItem = { productId: number; quantity: number }
type CartState = { items: CartItem[]; addItem: (item: CartItem) => void; clear: () => void }

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [{ productId: 1, quantity: 1 }],
  addItem: (item) => set((state) => {
    const existing = state.items.find((cartItem) => cartItem.productId === item.productId)
    return {
      items: existing
        ? state.items.map((cartItem) => cartItem.productId === item.productId ? { ...cartItem, quantity: cartItem.quantity + item.quantity } : cartItem)
        : [...state.items, item],
    }
  }),
  clear: () => set({ items: [] }),
}), { name: 'lookchin-cart-v2' }))
