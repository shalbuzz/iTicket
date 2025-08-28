import api from "../lib/api"
import type { EventListItem } from "./events"

export const listFavorites = async (): Promise<EventListItem[]> => {
  const response = await api.get("/favorites")
  return response.data
}

export const addFavorite = async (eventId: string): Promise<void> => {
  await api.post("/favorites", { eventId })
}

export const removeFavorite = async (eventId: string): Promise<void> => {
  await api.delete(`/favorites/${eventId}`)
}
