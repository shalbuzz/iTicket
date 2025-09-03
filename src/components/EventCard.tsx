"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { FavoriteButton } from "./FavoriteButton"
import { Calendar, MapPin, Users, Star } from "./icons"
import { formatCurrency } from "../lib/utils"

interface EventCardProps {
  event: {
    id: string
    title: string
    category?: string
    description?: string
    location?: string
    date?: string
    price?: number
    imageUrl?: string
    attendeeCount?: number
    rating?: number
    isFavorite?: boolean
  }
  index?: number
}

// простая проверка на GUID v1–v5
const isGuid = (s?: string) =>
  !!s && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(s)

export const EventCard: React.FC<EventCardProps> = ({ event, index = 0 }) => {
  const safeId = useMemo(() => event?.id?.trim() || "", [event?.id])
  const guidOk = isGuid(safeId)

  // локальный флаг, чтобы UI сразу реагировал на клик по избранному
  const [fav, setFav] = useState<boolean>(!!event.isFavorite)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Card className="event-card overflow-hidden border-0 shadow-md bg-card/50 backdrop-blur-sm relative">
        {/* Favorite Button: показываем только при валидном GUID */}
        {guidOk && (
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <FavoriteButton
              eventId={safeId}
              isFavorite={fav}
              size="sm"
              onChange={(next) => setFav(next)}
            />
          </div>
        )}

        {/* Event Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
          {event.imageUrl ? (
            <img
              src={event.imageUrl || "/placeholder.svg"}
              alt={event.title}
              className="event-card-image w-full h-full object-cover"
            />
          ) : (
            <div className="event-card-image w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <Calendar className="h-16 w-16 text-primary/40" />
            </div>
          )}

          {/* Category Badge */}
          {event.category && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                {event.category}
              </Badge>
            </div>
          )}

          {/* Rating */}
          {typeof event.rating === "number" && (
            <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-3 w-3 fill-secondary text-secondary" />
              <span className="text-xs font-medium">{event.rating}</span>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="font-bold text-lg leading-tight text-balance group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Event Details */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {event.date && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {typeof event.attendeeCount === "number" && (
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{event.attendeeCount} attending</span>
              </div>
            )}
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2 border-t">
            {typeof event.price === "number" ? (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Starting from</span>
                <span className="text-xl font-bold text-secondary">{formatCurrency(event.price)}</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Free Event</span>
              </div>
            )}

            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link to={`/events/${safeId}`} aria-label={`View details for ${event.title}`}>
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
