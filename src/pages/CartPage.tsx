"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getMyCart, removeCartItem, type CartResponse } from "../services/cart"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { CreditCard, Trash2 } from "../components/icons"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { ConfirmDialog } from "../components/ui/confirm-dialog"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
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
        <PageTitle>Cart</PageTitle>
        <div className="text-center">Loading cart...</div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>Cart</PageTitle>
        <Card>
          <CardContent className="p-6 text-center text-destructive">{error}</CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <PageContainer>
        <PageTitle>Cart</PageTitle>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">Cart is empty</CardContent>
        </Card>
      </PageContainer>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0)

  return (
    <PageContainer>
      <PageTitle>Cart</PageTitle>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TicketTypeId</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>UnitPrice</TableHead>
                <TableHead>LineTotal</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{item.ticketTypeId}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>{formatCurrency(item.lineTotal)}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmDialog({ open: true, itemIndex: index, loading: false })}
                      aria-label="Remove item from cart"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center text-lg font-bold mb-4">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <Button onClick={() => navigate("/checkout")} className="w-full" aria-label="Proceed to checkout">
            <CreditCard className="mr-2 h-4 w-4" />
            Checkout
          </Button>
        </CardContent>
      </Card>

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
