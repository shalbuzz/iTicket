import api from "../lib/api"

export interface EventListItem {
  id: string
  title: string
  category?: string
  posterUrl?: string
}

export interface TicketType {
  id: string
  name: string
  price: number
  capacity?: number
}

export interface Performance {
  id: string
  startAt: string
  ticketTypes: TicketType[]
}

export interface EventDetails {
  id: string
  title: string
  description?: string
  performances: Performance[]
}

/** Главная: список событий */
export const listEvents = async (): Promise<EventListItem[]> => {
  const { data } = await api.get("/events")
  return data
}

/** Детали события */
export const getEvent = async (id: string): Promise<EventDetails> => {
  const { data } = await api.get(`/events/${id}`)
  return data
}

/** Поиск/фильтр (пригодится) */
export const searchEvents = async (params: {
  q?: string
  category?: string
  fromUtc?: string
  toUtc?: string
  take?: number
}): Promise<EventListItem[]> => {
  const { data } = await api.get("/events/search", { params })
  return data
}

/** События организатора (пригодится) */
export const listByOrganizer = async (organizerId: string): Promise<EventListItem[]> => {
  const { data } = await api.get(`/events/by-organizer/${organizerId}`)
  return data
}
