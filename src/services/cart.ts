import api from "../lib/api"

export interface CartItem { id: string; ticketTypeId: string; quantity: number; unitPrice: number; lineTotal: number }
export interface CartDetails { id: string; userId: string; items: CartItem[] }
export interface AddCartItemReq { ticketTypeId: string; quantity: number }

export const getMyCart = async (): Promise<CartDetails> => {
  const { data } = await api.get("/cart/mine")
  return data
}

export const addCartItem = async (req: AddCartItemReq): Promise<void> => {
  await api.post("/cart/items", req)
}

export const updateCartItem = async (itemId: string, quantity: number): Promise<void> => {
  await api.put(`/cart/items/${itemId}`, { quantity })
}

export const removeCartItem = async (itemId: string): Promise<void> => {
  await api.delete(`/cart/items/${itemId}`)
}
