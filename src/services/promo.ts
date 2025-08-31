import api from "../lib/api"

export interface PromoCheckRequest {
  code: string
  subtotal: number
}

export interface PromoCheckResponse {
  isValid: boolean
  reason?: string | null
  code: string
  type: "Percent" | "Amount"
  value: number
  discount: number
  totalAfter: number
  startsAt?: string | null
  endsAt?: string | null
  usageLimit?: number | null
  usedCount: number
}

export const checkPromo = async (req: PromoCheckRequest): Promise<PromoCheckResponse> => {
  const { data } = await api.post("/promo/check", req)
  return data
}
