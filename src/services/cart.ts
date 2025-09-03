// src/services/cart.ts
import api from "../lib/api"

export type CartItem = {
  itemId: string      // GUID cart item'a (нужен для DELETE/PATCH)
  ticketTypeId: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type CartResponse = {
  id?: string
  items: CartItem[]
  total: number
}

/**
 * Полная корзина (для страницы /cart).
 * 404 => пустая корзина (items: [], total: 0)
 */
export async function getMyCart(): Promise<CartResponse> {
  try {
    const { data } = await api.get("/cart/mine")
    return data
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return { items: [], total: 0 }
    }
    throw err
  }
}

/**
 * Лёгкий счётчик для хедера. Ошибки не логируем, 404 => 0.
 */
export async function getCartCount(): Promise<number> {
  try {
    const { data } = await api.get("/cart/mine")
    return Array.isArray(data?.items) ? data.items.length : 0
  } catch (err: any) {
    if (err?.response?.status === 404) return 0
    return 0
  }
}

export async function addCartItem(ticketTypeId: string, quantity: number) {
  const { data } = await api.post("/cart/items", { ticketTypeId, quantity })
  return data as CartResponse
}

export async function updateCartItemQty(itemId: string, quantity: number) {
  const { data } = await api.patch(`/cart/items/${itemId}`, { quantity })
  return data as CartResponse
}

export async function removeCartItem(itemId: string) {
  const { data } = await api.delete(`/cart/items/${itemId}`)
  return data as CartResponse
}

export async function clearCart() {
  await api.delete("/cart/clear")
}
