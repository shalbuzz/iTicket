import { create } from "zustand"
import { getMyCart } from "../services/cart"

interface CartState {
  count: number
  setCount: (count: number) => void
  refresh: () => Promise<void>
}

export const useCart = create<CartState>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  refresh: async () => {
    try {
      const cart = await getMyCart()
      const totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
      set({ count: totalCount })
    } catch (error) {
      console.error("Failed to refresh cart count:", error)
      set({ count: 0 })
    }
  },
}))
