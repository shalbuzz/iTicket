import api from "../lib/api"

export interface EventListItem {
  id: string
  title: string
  category?: string
  posterUrl?: string
}
export interface TicketType { id: string; name: string; price: number; capacity?: number }
export interface Performance { id: string; startAt: string; ticketTypes: TicketType[] }
export interface EventDetails { id: string; title: string; description?: string; performances: Performance[] }

// Рекомендуемый список: search с take
export const listEvents = async (take: number = 50): Promise<EventListItem[]> => {
  const { data } = await api.get("/events/search", { params: { take } })
  return data
}

// Если на бэке есть GET /api/Events/{id} — оставляем
export const getEvent = async (id: string): Promise<EventDetails> => {
  const { data } = await api.get(`/events/${id}`)
  return data
}
