"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { listFavorites, removeFavorite, type FavoriteEvent } from "../services/favorites"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
import { LoadingState } from "../components/LoadingState"
import { EmptyState } from "../components/EmptyState"
import { ErrorState } from "../components/ErrorState"
import { Star, Calendar, Eye } from "../components/icons"
import { showApiError } from "../lib/api-error"
import { ok } from "../lib/notify"

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const data = await listFavorites()
      setFavorites(data)
      setError("")
    } catch (err: any) {
      setError("Failed to load favorites")
      showApiError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  const handleRemove = async (eventId: string) => {
    setRemovingIds((prev) => new Set(prev).add(eventId))

    try {
      await removeFavorite(eventId)
      setFavorites((prev) => prev.filter((fav) => fav.id !== eventId))
      ok("Removed from favorites")
    } catch (err: any) {
      showApiError(err)
    } finally {
      setRemovingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>My Favorites</PageTitle>
        <LoadingState text="Loading your favorites..." />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>My Favorites</PageTitle>
        <ErrorState message={error} onRetry={loadFavorites} showCard />
      </PageContainer>
    )
  }

  if (favorites.length === 0) {
    return (
      <PageContainer>
        <PageTitle>My Favorites</PageTitle>
        <EmptyState
          icon={<Star className="h-16 w-16 text-primary/40" />}
          title="No favorites yet"
          description="Start exploring events and add them to your favorites to see them here!"
          action={{
            label: "Browse Events",
            onClick: () => (window.location.href = "/"),
          }}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageTitle>My Favorites</PageTitle>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {favorites.map((favorite, index) => {
          const isRemoving = removingIds.has(favorite.id)
          return (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-md bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                  {favorite.posterUrl ? (
                    <img
                      src={favorite.posterUrl || "/placeholder.svg"}
                      alt={favorite.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <Calendar className="h-16 w-16 text-primary/40" />
                    </div>
                  )}

                  {/* Category Badge */}
                  {favorite.category && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                        {favorite.category}
                      </Badge>
                    </div>
                  )}

                  {/* Remove Button */}
                  <div className="absolute top-3 right-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(favorite.id)}
                      disabled={isRemoving}
                      className="bg-background/90 backdrop-blur-sm hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove from favorites"
                    >
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                    </Button>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg leading-tight text-balance group-hover:text-primary transition-colors">
                    {favorite.title}
                  </CardTitle>
                  {favorite.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{favorite.description}</p>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link to={`/events/${favorite.id}`} aria-label={`View details for ${favorite.title}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </PageContainer>
  )
}
