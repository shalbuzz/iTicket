// src/services/favorites.ts
import api from "../lib/api"

export type FavoriteEvent = {
  id: string            // <-- важно: id, НЕ eventId
  title: string
  category?: string
  imageUrl?: string
  date?: string
  priceFrom?: number
}

export async function listFavorites(): Promise<FavoriteEvent[]> {
  const { data } = await api.get("/favorites/mine")
  // предполагаем, что бэк отдаёт массив EventListItemDto с полями id/title/...
  return data as FavoriteEvent[]
}

export async function addFavorite(eventId: string): Promise<void> {
  if (!eventId) throw new Error("eventId is required")
  await api.post(`/favorites/${eventId}`)
}

export async function removeFavorite(eventId: string): Promise<void> {
  if (!eventId) throw new Error("eventId is required")
  await api.delete(`/favorites/${eventId}`)
}
