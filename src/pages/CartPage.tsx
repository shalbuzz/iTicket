"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getMyCart, removeCartItem, updateCartItem, type CartResponse } from "../services/cart"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { CreditCard, Trash2, ShoppingCart, Plus, Minus } from "../components/icons"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { ConfirmDialog } from "../components/ui/confirm-dialog"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
import { LoadingState } from "../components/LoadingState"
import { EmptyState } from "../components/EmptyState"
import { formatCurrency } from "../lib/utils"
import { showApiError } from "../lib/api-error"
import { ok } from "../lib/notify"

export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    itemId: string
    itemName: string
    loading: boolean
  }>({ open: false, itemId: "", itemName: "", loading: false })

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
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

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (!cart || newQuantity < 0) return

    const originalCart = { ...cart }
    setUpdatingItems((prev) => new Set(prev).add(itemId))

    // Optimistic update
    const updatedItems = cart.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          lineTotal: newQuantity * item.unitPrice,
        }
      }
      return item
    })

    setCart({ ...cart, items: updatedItems })

    try {
      if (newQuantity === 0) {
        await removeCartItem(itemId)
        setCart((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.filter((item) => item.id !== itemId),
              }
            : null,
        )
        ok("Item removed from cart")
      } else {
        await updateCartItem(itemId, newQuantity)
        ok("Cart updated")
      }
    } catch (err: any) {
      // Rollback on error
      setCart(originalCart)
      showApiError(err)
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async () => {
    if (!confirmDialog.itemId) return

    setConfirmDialog((prev) => ({ ...prev, loading: true }))

    try {
      await removeCartItem(confirmDialog.itemId)
      setCart((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((item) => item.id !== confirmDialog.itemId),
            }
          : null,
      )
      ok("Item removed from cart")
    } catch (err: any) {
      showApiError(err)
    } finally {
      setConfirmDialog({ open: false, itemId: "", itemName: "", loading: false })
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>Shopping Cart</PageTitle>
        <LoadingState text="Loading your cart..." />
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
            <Button variant="outline" onClick={loadCart} className="mt-4 bg-transparent">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item, index) => {
                    const isUpdating = updatingItems.has(item.id)
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.ticketTypeName || `Ticket ${item.ticketTypeId}`}</p>
                            <p className="text-sm text-muted-foreground font-mono">{item.ticketTypeId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = Number.parseInt(e.target.value) || 1
                                if (newQuantity !== item.quantity) {
                                  handleQuantityChange(item.id, newQuantity)
                                }
                              }}
                              disabled={isUpdating}
                              className="w-16 text-center h-8"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isUpdating || item.quantity >= 10}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-secondary">
                          {isUpdating ? (
                            <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                          ) : (
                            formatCurrency(item.lineTotal)
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                itemId: item.id,
                                itemName: item.ticketTypeName || `Ticket ${item.ticketTypeId}`,
                                loading: false,
                              })
                            }
                            disabled={isUpdating}
                            aria-label="Remove item from cart"
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
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
        description={`Are you sure you want to remove "${confirmDialog.itemName}" from your cart?`}
        onConfirm={handleRemoveItem}
        loading={confirmDialog.loading}
      />
    </PageContainer>
  )
}
