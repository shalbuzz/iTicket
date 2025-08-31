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

export const createIntent = async (orderId: string): Promise<PaymentIntentResponse> => {
  const response = await api.post("/payments/intent", { orderId })
  return response.data
}

export const capture = async (paymentId: string): Promise<PaymentDetails> => {
  const response = await api.post(`/payments/${paymentId}/capture`)
  return response.data
}
