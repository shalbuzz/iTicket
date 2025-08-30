"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../stores/auth"
import { useCart } from "../stores/cart"
import { getEvent, type EventDetails } from "../services/events"
import { addCartItem } from "../services/cart"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Calendar, MapPin, Clock, Users, ShoppingCart } from "../components/icons"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { PageContainer } from "../components/PageContainer"
import { LoadingState } from "../components/LoadingState"
import { ErrorState } from "../components/ErrorState"
import { FavoriteButton } from "../components/FavoriteButton"
import { ShareButton } from "../components/ShareButton"
import { formatCurrency } from "../lib/utils"
import { showApiError } from "../lib/api-error"
import { ok } from "../lib/notify"

export const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { accessToken } = useAuth()
  const { refresh: refreshCart } = useCart()
  const navigate = useNavigate()

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return

      try {
        const data = await getEvent(id)
        setEvent(data)
      } catch (err: any) {
        setError("Failed to load event details")
        showApiError(err)
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [id])

  const handleAddToCart = async (ticketTypeId: string, ticketTypeName: string) => {
    if (!accessToken) {
      navigate("/login")
      return
    }

    setAddingToCart(ticketTypeId)
    try {
      await addCartItem({ ticketTypeId, quantity: 1 })
      await refreshCart()
      ok(`${ticketTypeName} added to cart!`)
      navigate("/cart")
    } catch (err: any) {
      showApiError(err)
    } finally {
      setAddingToCart(null)
    }
  }

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
        {/* Event Header */}
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

        {/* Event Details */}
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

        {/* Performances */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Available Tickets</h2>

          {event.performances.map((performance, index) => (
            <motion.div
              key={performance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-lg font-semibold">{new Date(performance.startAt).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(performance.startAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {performance.availableSeats && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{performance.availableSeats} seats available</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performance.ticketTypes.map((ticketType) => (
                          <TableRow key={ticketType.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticketType.name}</p>
                                {ticketType.description && (
                                  <p className="text-sm text-muted-foreground">{ticketType.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-lg font-bold text-secondary">
                                {formatCurrency(ticketType.price)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                onClick={() => handleAddToCart(ticketType.id, ticketType.name)}
                                disabled={addingToCart === ticketType.id}
                                className="bg-primary hover:bg-primary/90"
                                aria-label={`Add ${ticketType.name} to cart`}
                              >
                                {addingToCart === ticketType.id ? (
                                  "Adding..."
                                ) : (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add to Cart
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageContainer>
  )
}
