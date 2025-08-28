import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const promoSchema = z.object({
  code: z.string().min(1, "Please enter a promo code").optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type PromoFormData = z.infer<typeof promoSchema>
