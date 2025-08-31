import api from "../lib/api"
import type { EventListItem } from "./events"

export type FavoriteEvent = EventListItem

/** Список избранного для текущего пользователя */
export const listFavorites = async (): Promise<EventListItem[]> => {
  const response = await api.get("/favorites/mine")
  return response.data
}

/** Добавить событие в избранное */
export const addFavorite = async (eventId: string): Promise<void> => {
  await api.post(`/favorites/${eventId}`)
}

/** Убрать событие из избранного */
export const removeFavorite = async (eventId: string): Promise<void> => {
  await api.delete(`/favorites/${eventId}`)
}
