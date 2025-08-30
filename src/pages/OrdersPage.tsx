"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { getMyOrders, type OrderListItem, type PageResponse } from "../services/orders"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
import { formatCurrency } from "../lib/utils"
import { ChevronLeft, ChevronRight } from "../components/icons"

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number.parseInt(searchParams.get("page") || "1")
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "20")

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data: PageResponse<OrderListItem> = await getMyOrders(page, pageSize)
        setOrders(data.items)
        setTotalOrders(data.total)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [page, pageSize])

  const totalPages = Math.ceil(totalOrders / pageSize)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    setSearchParams(params)
  }

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>My Orders</PageTitle>
        <div className="text-center">Loading orders...</div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>My Orders</PageTitle>
        <Card>
          <CardContent className="p-6 text-center text-destructive">{error}</CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageTitle>My Orders</PageTitle>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">You have no orders yet</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">#{order.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "completed" || order.status === "paid"
                              ? "default"
                              : order.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalOrders)} of {totalOrders} orders
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
