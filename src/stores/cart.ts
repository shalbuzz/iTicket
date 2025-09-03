// src/stores/cart.ts
import { create } from "zustand"
import { getCartCount } from "../services/cart"

interface CartState {
  count: number
  setCount: (count: number) => void
  refresh: () => Promise<void>
}

export const useCart = create<CartState>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  refresh: async () => {
    const totalCount = await getCartCount() // 404 => 0, без ошибок
    set({ count: totalCount })
  },
}))
