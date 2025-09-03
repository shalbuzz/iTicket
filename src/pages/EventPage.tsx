"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../stores/auth"
import { useCart } from "../stores/cart"
import { getEvent, type EventDetails } from "../services/events"
import { addCartItem } from "../services/cart"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Input } from "../components/ui/input"
import { Calendar, MapPin, Clock, Users, ShoppingCart, Plus, Minus } from "../components/icons"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { PageContainer } from "../components/PageContainer"
import { LoadingState } from "../components/LoadingState"
import { ErrorState } from "../components/ErrorState"
import { FavoriteButton } from "../components/FavoriteButton"
import { ShareButton } from "../components/ShareButton"
import { formatCurrency } from "../lib/utils"
import { showApiError } from "../lib/api-error"
import { ok } from "../lib/notify"

interface TicketSelection {
  ticketTypeId: string
  quantity: number
  name: string
  price: number
}

export const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const { refresh: refreshCart } = useCart()
  const navigate = useNavigate()

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [addingToCart, setAddingToCart] = useState(false)
  const [ticketSelections, setTicketSelections] = useState<Record<string, TicketSelection>>({})
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string>("")

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return

      try {
        const data = await getEvent(id)
        setEvent(data)
        if (data.performances && data.performances.length > 0) {
          setSelectedPerformanceId(data.performances[0].id)
        }
      } catch (err: any) {
        setError("Failed to load event details")
        showApiError(err)
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [id])

  const updateTicketQuantity = (ticketTypeId: string, quantity: number, ticketType: any) => {
    if (quantity <= 0) {
      const newSelections = { ...ticketSelections }
      delete newSelections[ticketTypeId]
      setTicketSelections(newSelections)
    } else {
      const maxQuantity = ticketType.capacity || 10
      const finalQuantity = Math.min(quantity, maxQuantity)

      setTicketSelections((prev) => ({
        ...prev,
        [ticketTypeId]: {
          ticketTypeId,
          quantity: finalQuantity,
          name: ticketType.name,
          price: ticketType.price,
        },
      }))
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    const selections = Object.values(ticketSelections).filter((s) => s.quantity > 0)
    if (selections.length === 0) {
      return
    }

    setAddingToCart(true)
    try {
      for (const selection of selections) {
        await addCartItem({
          ticketTypeId: selection.ticketTypeId,
          quantity: selection.quantity,
        })
      }

      await refreshCart()
      const totalTickets = selections.reduce((sum, s) => sum + s.quantity, 0)
      ok(`${totalTickets} ticket(s) added to cart!`)

      setTicketSelections({})
    } catch (err: any) {
      showApiError(err)
    } finally {
      setAddingToCart(false)
    }
  }

  const selectedPerformance = event?.performances?.find((p) => p.id === selectedPerformanceId)
  const totalSelectedTickets = Object.values(ticketSelections).reduce((sum, s) => sum + s.quantity, 0)
  const totalPrice = Object.values(ticketSelections).reduce((sum, s) => sum + s.quantity * s.price, 0)

  if (loading) {
    return (
      <PageContainer>
        <LoadingState text="Loading event details..." fullPage />
      </PageContainer>
    )
  }

  if (error || !event) {
    return (
      <PageContainer>
        <ErrorState
          type="notfound"
          message={error || "Event not found"}
          onRetry={() => window.location.reload()}
          showCard
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <Card className="overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="relative">
            {event.imageUrl && (
              <div className="h-64 md:h-80 overflow-hidden">
                <img
                  src={event.imageUrl || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            <div className={`${event.imageUrl ? "absolute bottom-0 left-0 right-0 text-white" : ""} p-6`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {event.category && (
                      <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground">
                        {event.category}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-balance">{event.title}</h1>

                  {event.description && (
                    <p
                      className={`text-lg leading-relaxed max-w-3xl ${event.imageUrl ? "text-white/90" : "text-muted-foreground"}`}
                    >
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <FavoriteButton eventId={event.id} />
                  <ShareButton title={event.title} description={event.description} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {(event.location || event.startDate) && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Venue</p>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.startDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">{new Date(event.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Select Tickets</h2>
            {totalSelectedTickets > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{totalSelectedTickets} tickets selected</p>
                <p className="text-lg font-bold text-secondary">{formatCurrency(totalPrice)}</p>
              </div>
            )}
          </div>

          {event.performances && event.performances.length > 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs value={selectedPerformanceId} onValueChange={setSelectedPerformanceId}>
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-auto p-1">
                    {event.performances.map((performance) => (
                      <TabsTrigger
                        key={performance.id}
                        value={performance.id}
                        className="flex flex-col items-center p-4 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">{new Date(performance.startAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm opacity-80">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(performance.startAt).toLocaleTimeString()}</span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {event.performances.map((performance) => (
                    <TabsContent key={performance.id} value={performance.id} className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Available Tickets</h3>
                          {performance.availableSeats && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{performance.availableSeats} seats available</span>
                            </div>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ticket Type</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {performance.ticketTypes && performance.ticketTypes.length > 0 ? (
                                performance.ticketTypes.map((ticketType) => {
                                  const selection = ticketSelections[ticketType.id]
                                  const quantity = selection?.quantity || 0
                                  const subtotal = quantity * ticketType.price
                                  const maxQuantity = ticketType.capacity || 10

                                  return (
                                    <TableRow key={ticketType.id} className="hover:bg-muted/50">
                                      <TableCell>
                                        <div>
                                          <p className="font-medium">{ticketType.name}</p>
                                          {ticketType.description && (
                                            <p className="text-sm text-muted-foreground">{ticketType.description}</p>
                                          )}
                                          {ticketType.capacity && (
                                            <p className="text-xs text-muted-foreground">
                                              Max {ticketType.capacity} per order
                                            </p>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-lg font-bold text-secondary">
                                          {formatCurrency(ticketType.price)}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              updateTicketQuantity(ticketType.id, quantity - 1, ticketType)
                                            }
                                            disabled={quantity <= 0}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <Input
                                            type="number"
                                            min="0"
                                            max={maxQuantity}
                                            value={quantity}
                                            onChange={(e) =>
                                              updateTicketQuantity(
                                                ticketType.id,
                                                Number.parseInt(e.target.value) || 0,
                                                ticketType,
                                              )
                                            }
                                            className="w-16 text-center h-8"
                                          />
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              updateTicketQuantity(ticketType.id, quantity + 1, ticketType)
                                            }
                                            disabled={quantity >= maxQuantity}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <span className="font-medium">
                                          {quantity > 0 ? formatCurrency(subtotal) : "-"}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    No ticket types available for this performance
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                {totalSelectedTickets > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-sm text-muted-foreground">{totalSelectedTickets} ticket(s) selected</p>
                        <p className="text-2xl font-bold text-secondary">Total: {formatCurrency(totalPrice)}</p>
                      </div>
                      <Button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 min-w-48"
                      >
                        {addingToCart ? (
                          "Adding to Cart..."
                        ) : (
                          <>
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg">No performances available for this event</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </PageContainer>
  )
}
