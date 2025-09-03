import api from "../lib/api"
import type { EventListItem } from "./events"

export type FavoriteEvent = EventListItem

export const listFavorites = async (): Promise<EventListItem[]> => {
  const response = await api.get("/favorites/mine")
  return response.data
}

export const addFavorite = async (eventId: string): Promise<void> => {
  await api.post(`/favorites/${eventId}`)
}

export const removeFavorite = async (eventId: string): Promise<void> => {
  await api.delete(`/favorites/${eventId}`)
}

export const isFavorite = async (eventId: string): Promise<boolean> => {
  try {
    const response = await api.get(`/favorites/${eventId}`)
    return response.status === 200
  } catch {
    return false
  }
}
