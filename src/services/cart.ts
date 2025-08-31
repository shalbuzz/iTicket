import api from "../lib/api"

export interface CartItem {
  id: string
  ticketTypeId: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface CartDetails {
  id: string
  userId: string
  items: CartItem[]
}

export interface AddCartItemReq {
  ticketTypeId: string
  quantity: number
}

export type CartResponse = CartDetails

// было: GET "/cart" → 404
export const getMyCart = async (): Promise<CartDetails> => {
  const { data } = await api.get("/cart/mine")
  return data
}

export const addCartItem = async (req: AddCartItemReq): Promise<void> => {
  await api.post("/cart/items", req)
}

// было: PUT → на бэке PATCH
export const updateCartItem = async (itemId: string, quantity: number): Promise<void> => {
  await api.patch(`/cart/items/${itemId}`, { quantity })
}

export const removeCartItem = async (itemId: string): Promise<void> => {
  await api.delete(`/cart/items/${itemId}`)
}
