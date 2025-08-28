"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createOrder } from "../services/orders"
import { createIntent, capture } from "../services/payments"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { toast } from "../hooks/use-toast"

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const [promo, setPromo] = useState("")
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState("")

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handlePay = async () => {
    setLoading(true)
    setError("")
    setLogs([])

    try {
      addLog("Creating order...")
      const order = await createOrder(promo || undefined)
      addLog(`Order created: #${order.id}`)
      toast({
        title: "Order created",
        description: `Order #${order.id} has been created successfully.`,
      })

      addLog("Creating payment intent...")
      const intent = await createIntent(order.id)
      addLog(`Payment intent created: ${intent.paymentId}`)
      toast({
        title: "Payment processing",
        description: "Payment intent created, processing payment...",
      })

      addLog("Capturing payment...")
      await capture(intent.paymentId)
      addLog("Payment captured successfully!")
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully!",
      })

      addLog("Redirecting to orders...")
      setTimeout(() => navigate("/orders"), 1000)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Payment failed"
      setError(errorMsg)
      addLog(`Error: ${errorMsg}`)
      toast({
        title: "Payment failed",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Оформление заказа</h1>

      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Promo Code (optional)</label>
              <Input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Enter promo code"
                disabled={loading}
              />
            </div>

            <Button onClick={handlePay} disabled={loading} className="w-full">
              {loading ? "Processing..." : "Pay"}
            </Button>
          </CardContent>
        </Card>

        {(logs.length > 0 || error) && (
          <Card className="max-w-md mx-auto mt-6">
            <CardHeader>
              <CardTitle>Process Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 font-mono">
                {logs.map((log, index) => (
                  <li key={index} className="text-gray-600">
                    {log}
                  </li>
                ))}
                {error && <li className="text-red-600 font-bold">{error}</li>}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
