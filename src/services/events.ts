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

export const listEvents = async (): Promise<EventListItem[]> => {
  const response = await api.get("/events")
  return response.data
}

export const getEvent = async (id: string): Promise<EventDetails> => {
  const response = await api.get(`/events/${id}`)
  return response.data
}
