import api from "../lib/api"

export type OrderStatus = "Pending" | "Paid" | "Cancelled"

export interface OrderListItem {
  id: string
  orderNumber: number
  status: OrderStatus
  total: number
  createdAt: string
}

export interface PageResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** Создание заказа (из текущих reservations/cart), промокод опционален */
export const createOrder = async (promoCode?: string | null): Promise<{ id: string }> => {
  const response = await api.post("/orders", { promoCode: promoCode ?? null })
  return response.data
}

/** Список МОИХ заказов, пагинация через query (?page=&pageSize=) */
export const getMyOrders = async (
  page = 1,
  pageSize = 20
): Promise<PageResponse<OrderListItem>> => {
  const response = await api.get("/orders/mine", { params: { page, pageSize } })
  return response.data
}

/** Детали одного заказа (если нужен детальный просмотр) */
export const getOrder = async (id: string): Promise<any> => {
  const response = await api.get(`/orders/${id}`)
  return response.data
}
