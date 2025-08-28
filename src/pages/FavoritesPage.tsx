"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { listFavorites, removeFavorite, type FavoriteEvent } from "../services/favorites"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Star } from "../components/icons"
import { toast } from "../hooks/use-toast"
import { Badge } from "../../components/ui/badge"

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadFavorites = async () => {
    try {
      const data = await listFavorites()
      setFavorites(data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load favorites")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  const handleRemove = async (eventId: string) => {
    try {
      await removeFavorite(eventId)
      toast({
        title: "Removed from favorites",
        description: "Event has been removed from your favorites.",
      })
      await loadFavorites() // Refresh the list
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to remove favorite",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading favorites...</div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Favorites</h1>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">No favorites found</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((favorite) => (
            <Card key={favorite.eventId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{favorite.title}</CardTitle>
                {favorite.category && <Badge variant="secondary">{favorite.category}</Badge>}
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleRemove(favorite.eventId)}
                  variant="ghost"
                  size="icon"
                  className="text-yellow-500 hover:text-yellow-600"
                >
                  <Star className="h-4 w-4 fill-current" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
