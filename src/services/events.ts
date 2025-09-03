import api from "../lib/api"

export interface EventListItem {
  id: string
  title: string
  category?: string
  posterUrl?: string
  description?: string
  isFavorite?: boolean
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

export interface EventSearchParams {
  q?: string
  category?: string
  fromUtc?: string
  toUtc?: string
  take?: number
  skip?: number
}

export interface EventSearchResponse {
  items: EventListItem[]
  total: number
  hasMore: boolean
}

export const listEvents = async (): Promise<EventListItem[]> => {
  const response = await api.get("/events")
  return response.data
}

export const getEvent = async (id: string): Promise<EventDetails> => {
  const response = await api.get(`/events/${id}`)
  return response.data
}

export const searchEvents = async (params: EventSearchParams): Promise<EventSearchResponse> => {
  const searchParams = new URLSearchParams()

  if (params.q) searchParams.append("q", params.q)
  if (params.category) searchParams.append("category", params.category)
  if (params.fromUtc) searchParams.append("fromUtc", params.fromUtc)
  if (params.toUtc) searchParams.append("toUtc", params.toUtc)
  if (params.take) searchParams.append("take", params.take.toString())
  if (params.skip) searchParams.append("skip", params.skip.toString())

  const response = await api.get(`/events/search?${searchParams.toString()}`)
  return response.data
}

export const getCategories = async (search?: string): Promise<string[]> => {
  const params = search ? `?search=${encodeURIComponent(search)}` : ""
  const response = await api.get(`/categories${params}`)
  return response.data
}

export const getEventsByOrganizer = async (organizerId: string): Promise<EventListItem[]> => {
  const response = await api.get(`/events/by-organizer/${organizerId}`)
  return response.data
}
