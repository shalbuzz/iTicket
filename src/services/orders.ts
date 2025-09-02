import api from "../lib/api"

export interface OrderListItem {
  id: string
  orderNumber: number
  status: string
  total: number
  createdAt: string
}

export interface PageResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export const createOrder = async (promoCode?: string | null) =>
  (await api.post("/orders", { promoCode: promoCode ?? null })).data

export const getMyOrders = async (page?: number, pageSize?: number) =>
  (await api.get("/orders/mine", { params: { page, pageSize } })).data

export const getOrder = async (id: string) =>
  (await api.get(`/orders/${id}`)).data
