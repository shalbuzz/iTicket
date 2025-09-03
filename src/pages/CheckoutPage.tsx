"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getMyCart, type CartResponse } from "../services/cart"
import { checkPromo, type PromoCheckResponse } from "../services/promo"
import { createOrder } from "../services/orders"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Separator } from "../components/ui/separator"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
import { LoadingState } from "../components/LoadingState"
import { CreditCard, Tag, CheckCircle, AlertCircle, ShoppingCart } from "../components/icons"
import { formatCurrency } from "../lib/utils"
import { showApiError } from "../lib/api-error"
import { ok } from "../lib/notify"

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState("")
  const [promoResult, setPromoResult] = useState<PromoCheckResponse | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const data = await getMyCart()
      setCart(data)
      setError("")
    } catch (err: any) {
      setError("Failed to load cart")
      showApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !cart) return

    setPromoLoading(true)
    try {
      const subtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0)
      const result = await checkPromo({ code: promoCode.trim(), subtotal })
      setPromoResult(result)

      if (result.isValid) {
        ok(`Promo code applied! You saved ${formatCurrency(result.discount)}`)
      }
    } catch (err: any) {
      setPromoResult(null)
      showApiError(err)
    } finally {
      setPromoLoading(false)
    }
  }

  const handleClearPromo = () => {
    setPromoCode("")
    setPromoResult(null)
  }

  const handleCreateOrder = async () => {
    if (!cart) return

    setOrderLoading(true)
    try {
      const promoCodeToUse = promoResult?.isValid ? promoResult.code : undefined
      const order = await createOrder(promoCodeToUse)

      ok("Order created successfully!")
      navigate(`/orders/${order.id}`)
    } catch (err: any) {
      showApiError(err)
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>Checkout</PageTitle>
        <LoadingState text="Loading checkout..." />
      </PageContainer>
    )
  }

  if (error || !cart || cart.items.length === 0) {
    return (
      <PageContainer>
        <PageTitle>Checkout</PageTitle>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-destructive font-medium mb-2">{error || "Your cart is empty"}</div>
            <p className="text-muted-foreground mb-4">
              {error ? "Please try again or contact support." : "Add some tickets to your cart before checkout."}
            </p>
            <Button variant="outline" onClick={() => navigate(error ? "/cart" : "/")}>
              {error ? "Back to Cart" : "Browse Events"}
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0)
  const discount = promoResult?.isValid ? promoResult.discount : 0
  const total = promoResult?.isValid ? promoResult.totalAfter : subtotal

  return (
    <PageContainer>
      <PageTitle>Checkout</PageTitle>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Order Summary */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-center py-2"
              >
                <div>
                  <p className="font-medium">{item.ticketTypeName || `Ticket ${item.ticketTypeId}`}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <span className="font-medium">{formatCurrency(item.lineTotal)}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Promo Code Section */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Promo Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!promoResult?.isValid ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoLoading}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                />
                <Button onClick={handleApplyPromo} disabled={!promoCode.trim() || promoLoading} variant="outline">
                  {promoLoading ? "Checking..." : "Apply"}
                </Button>
              </div>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="flex justify-between items-center">
                  <span className="text-green-800">
                    Promo code "{promoResult.code}" applied!
                    {promoResult.type === "Percent"
                      ? ` ${promoResult.value}% discount`
                      : ` ${formatCurrency(promoResult.value)} off`}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleClearPromo}>
                    Remove
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {promoResult && !promoResult.isValid && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{promoResult.reason || "Invalid promo code"}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Order Total */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-lg">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-lg text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-secondary">{formatCurrency(total)}</span>
            </div>

            <Button
              onClick={handleCreateOrder}
              disabled={orderLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {orderLoading ? (
                "Creating Order..."
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Create Order
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  )
}
