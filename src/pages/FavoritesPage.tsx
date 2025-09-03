// src/pages/FavoritesPage.tsx
"use client"

import React, { useEffect, useState } from "react"
import { listFavorites, removeFavorite, type FavoriteEvent } from "../services/favorites"
// если нет icons.ts, просто удалите импорт и иконку в кнопке
import { Star } from "../components/icons"

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function load() {
    setLoading(true)
    try {
      const data = await listFavorites()
      setFavorites(data)
      setError("")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load favorites")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onRemove(id: string) {
    if (!id) return
    try {
      await removeFavorite(id)              // <-- отправляем именно id события
      setFavorites((prev) => prev.filter((x) => x.id !== id))
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to remove favorite")
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Favorites</h1>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Favorites</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Favorites</h1>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center text-muted-foreground">
          No favorites yet. Add events to your favorites to see them here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((f) => (
            <div key={f.id} className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{f.title}</div>
                    {f.category && (
                      <div className="mt-1 inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {f.category}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemove(f.id)}   // <-- используем f.id
                    className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm hover:bg-muted"
                    title="Remove from favorites"
                  >
                    <Star className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
