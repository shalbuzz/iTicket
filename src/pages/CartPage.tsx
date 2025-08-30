"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getMyCart, removeCartItem, type CartResponse } from "../services/cart"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { CreditCard, Trash2, ShoppingCart } from "../components/icons"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { ConfirmDialog } from "../components/ui/confirm-dialog"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
import { SkeletonTable } from "../components/ui/skeleton"
import { EmptyState } from "../components/EmptyState"
import { formatCurrency } from "../lib/utils"
import { fail, ok } from "../lib/notify"

export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    itemIndex: number
    loading: boolean
  }>({ open: false, itemIndex: -1, loading: false })

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await getMyCart()
        setCart(data)
      } catch (err: any) {
        const message = err.response?.data?.message || "Failed to load cart"
        setError(message)
        fail(message)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  const handleRemoveItem = async () => {
    if (!cart || confirmDialog.itemIndex === -1) return

    setConfirmDialog((prev) => ({ ...prev, loading: true }))

    try {
      const item = cart.items[confirmDialog.itemIndex]
      await removeCartItem(item.ticketTypeId)

      // Remove item from local state
      const updatedCart = {
        ...cart,
        items: cart.items.filter((_, index) => index !== confirmDialog.itemIndex),
      }
      setCart(updatedCart)

      ok("Item removed from cart")
    } catch (err: any) {
      fail(err.response?.data?.message || "Failed to remove item")
    } finally {
      setConfirmDialog({ open: false, itemIndex: -1, loading: false })
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>Shopping Cart</PageTitle>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span className="font-medium">Loading your cart...</span>
              </div>
            </CardHeader>
            <CardContent>
              <SkeletonTable rows={3} cols={5} />
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Subtotal:</span>
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        </motion.div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>Shopping Cart</PageTitle>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <div className="text-destructive font-medium mb-2">Error Loading Cart</div>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <PageContainer>
        <PageTitle>Shopping Cart</PageTitle>
        <EmptyState
          icon={<ShoppingCart className="h-16 w-16 text-primary/40" />}
          title="Your cart is empty"
          description="Looks like you haven't added any tickets yet. Browse events to get started!"
          action={{
            label: "Browse Events",
            onClick: () => navigate("/"),
          }}
        />
      </PageContainer>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0)

  return (
    <PageContainer>
      <PageTitle>Shopping Cart</PageTitle>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span>Cart Items ({cart.items.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-20">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="font-mono text-sm">{item.ticketTypeId}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="font-bold text-secondary">{formatCurrency(item.lineTotal)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDialog({ open: true, itemIndex: index, loading: false })}
                        aria-label="Remove item from cart"
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center text-xl font-bold mb-6">
              <span>Subtotal:</span>
              <span className="text-secondary">{formatCurrency(subtotal)}</span>
            </div>
            <Button
              onClick={() => navigate("/checkout")}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              aria-label="Proceed to checkout"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title="Remove Item"
        description="Are you sure you want to remove this item from your cart?"
        onConfirm={handleRemoveItem}
        loading={confirmDialog.loading}
      />
    </PageContainer>
  )
}
