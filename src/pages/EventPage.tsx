"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../stores/auth"
import { getEvent, type EventDetails } from "../services/events"
import { addCartItem } from "../services/cart"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Calendar } from "../components/icons"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { toast } from "../hooks/use-toast"

export const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return

      try {
        const data = await getEvent(id)
        setEvent(data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load event")
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [id])

  const handleAddToCart = async (ticketTypeId: string) => {
    if (!accessToken) {
      navigate("/login")
      return
    }

    try {
      await addCartItem({ ticketTypeId, quantity: 1 })
      toast({
        title: "Added to cart",
        description: "Ticket has been added to your cart successfully.",
      })
      navigate("/cart")
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add to cart",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading event...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Event not found</div>
      </div>
    )
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">{event.title}</CardTitle>
        </CardHeader>
        <CardContent>{event.description && <p className="text-muted-foreground">{event.description}</p>}</CardContent>
      </Card>

      <div className="space-y-6">
        {event.performances.map((performance) => (
          <Card key={performance.id} className="space-y-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {new Date(performance.startAt).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performance.ticketTypes.map((ticketType) => (
                    <TableRow key={ticketType.id}>
                      <TableCell>{ticketType.name}</TableCell>
                      <TableCell>${ticketType.price}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleAddToCart(ticketType.id)} size="sm">
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
