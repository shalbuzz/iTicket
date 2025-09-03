"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getOrder, type OrderDetails } from "../services/orders"
import { createIntent, capture, type PaymentIntentResponse } from "../services/payments"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Alert, AlertDescription } from "../components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Separator } from "../components/ui/separator"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
import { LoadingState } from "../components/LoadingState"
import { ErrorState } from "../components/ErrorState"
import { CreditCard, Calendar, Clock, CheckCircle, AlertCircle, Loader2, Receipt, Tag } from "../components/icons"
import { formatCurrency } from "../lib/utils"
import { showApiError } from "../lib/api-error"
import { ok } from "../lib/notify"

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null)

  useEffect(() => {
    if (!id) return
    loadOrder()
  }, [id])

  const loadOrder = async () => {
    if (!id) return

    try {
      setLoading(true)
      const data = await getOrder(id)
      setOrder(data)
      setError("")
    } catch (err: any) {
      setError("Failed to load order details")
      showApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!order) return

    setPaymentDialog(true)
    setPaymentLoading(true)

    try {
      const intent = await createIntent(order.id)
      setPaymentIntent(intent)
      ok("Payment intent created successfully")
    } catch (err: any) {
      showApiError(err)
      setPaymentDialog(false)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleCapturePayment = async () => {
    if (!paymentIntent) return

    setPaymentLoading(true)
    try {
      await capture(paymentIntent.paymentId)
      ok("Payment completed successfully!")

      // Reload order to get updated status
      await loadOrder()
      setPaymentDialog(false)
      setPaymentIntent(null)
    } catch (err: any) {
      showApiError(err)
    } finally {
      setPaymentLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const canPay = order && ["pending", "created"].includes(order.status.toLowerCase())

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>Order Details</PageTitle>
        <LoadingState text="Loading order details..." />
      </PageContainer>
    )
  }

  if (error || !order) {
    return (
      <PageContainer>
        <PageTitle>Order Details</PageTitle>
        <ErrorState type="notfound" message={error || "Order not found"} onRetry={loadOrder} showCard />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Order #{order.orderNumber}</PageTitle>
        <Badge variant={getStatusColor(order.status)} className="text-sm px-3 py-1">
          {order.status}
        </Badge>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Order Info */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold text-secondary">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-start p-4 bg-background/50 rounded-lg border"
              >
                <div className="space-y-2">
                  <h4 className="font-medium">{item.eventTitle}</h4>
                  <p className="text-sm text-muted-foreground">{item.ticketTypeName}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(item.performanceDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(item.performanceDate).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="text-sm">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(item.lineTotal)}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discount && order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Discount {order.promoCode && `(${order.promoCode})`}:
                </span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-secondary">{formatCurrency(order.total)}</span>
            </div>

            {canPay && (
              <Button
                onClick={handlePayment}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Pay Now
              </Button>
            )}

            {order.payment && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Payment completed on {new Date(order.payment.paidAt || order.payment.createdAt).toLocaleString()}
                  <br />
                  Payment ID: {order.payment.id}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              You are about to pay {formatCurrency(order.total)} for order #{order.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {paymentLoading && !paymentIntent && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Creating payment intent...</span>
            </div>
          )}

          {paymentIntent && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Payment intent created successfully. Amount: {formatCurrency(paymentIntent.amount)}
                <br />
                Payment ID: {paymentIntent.paymentId}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)} disabled={paymentLoading}>
              Cancel
            </Button>
            {paymentIntent && (
              <Button
                onClick={handleCapturePayment}
                disabled={paymentLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Payment
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
