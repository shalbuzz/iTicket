import api from "../lib/api"

export interface PaymentIntentResponse {
  paymentId: string
  orderId: string
  amount: number
  status: string
  createdAt: string
}

export interface PaymentDetails {
  id: string
  orderId: string
  amount: number
  status: string
  provider: string
  providerReference?: string
  paidAt?: string | null
  createdAt: string
}

/** Создать payment intent для заказа */
export const createIntent = async (orderId: string): Promise<PaymentIntentResponse> => {
  const response = await api.post(`/payments/${orderId}/intent`)
  return response.data
}

/** Захватить оплату */
export const capture = async (paymentId: string): Promise<PaymentDetails> => {
  const response = await api.post(`/payments/${paymentId}/capture`)
  return response.data
}
