"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getMyOrders, type OrderListItem, type PageResponse } from "../services/orders"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
import { LoadingState } from "../components/LoadingState"
import { EmptyState } from "../components/EmptyState"
import { ErrorState } from "../components/ErrorState"
import { formatCurrency } from "@/lib/utils"
import { showApiError } from "../lib/api-error"
import { ChevronLeft, ChevronRight, Receipt, Eye } from "../components/icons"

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number.parseInt(searchParams.get("page") || "1")
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "20")

  useEffect(() => {
    loadOrders()
  }, [page, pageSize])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data: PageResponse<OrderListItem> = await getMyOrders(page, pageSize)
      setOrders(data.items)
      setTotalOrders(data.total)
      setError("")
    } catch (err: any) {
      setError("Failed to load orders")
      showApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalOrders / pageSize)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    setSearchParams(params)
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

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>My Orders</PageTitle>
        <LoadingState text="Loading your orders..." />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>My Orders</PageTitle>
        <ErrorState message={error} onRetry={loadOrders} showCard />
      </PageContainer>
    )
  }

  if (orders.length === 0) {
    return (
      <PageContainer>
        <PageTitle>My Orders</PageTitle>
        <EmptyState
          icon={<Receipt className="h-16 w-16 text-primary/40" />}
          title="No orders yet"
          description="You haven't placed any orders yet. Start browsing events to make your first purchase!"
          action={{
            label: "Browse Events",
            onClick: () => navigate("/"),
          }}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageTitle>My Orders</PageTitle>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group hover:bg-muted/50"
                    >
                      <TableCell className="font-mono">#{order.orderNumber}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
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
      </motion.div>
    </PageContainer>
  )
}
