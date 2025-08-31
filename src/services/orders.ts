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

export const createOrder = async (promoCode?: string | null): Promise<{ id: string }> => {
  const response = await api.post("/orders", { promoCode })
  return response.data
}

export const getMyOrders = async (page?: number, pageSize?: number): Promise<PageResponse<OrderListItem>> => {
  const params = new URLSearchParams()
  if (page !== undefined) params.append("page", page.toString())
  if (pageSize !== undefined) params.append("pageSize", pageSize.toString())

  const response = await api.get(`/orders?${params.toString()}`)
  return response.data
}

export const getOrder = async (id: string): Promise<any> => {
  const response = await api.get(`/orders/${id}`)
  return response.data
}
