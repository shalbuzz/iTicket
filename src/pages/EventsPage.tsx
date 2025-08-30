"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { listEvents, type EventListItem } from "../services/events"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
import { EmptyState } from "../components/EmptyState"
import { ErrorState } from "../components/ErrorState"
import { Skeleton } from "../components/ui/skeleton"
import { Package } from "../components/icons"
import { showApiError } from "../lib/api-error"

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventListItem[]>([])
  const [filteredEvents, setFilteredEvents] = useState<EventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()

  const searchQuery = searchParams.get("q") || ""
  const categoryFilter = searchParams.get("cat") || ""

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await listEvents()
        setEvents(data)
      } catch (err: any) {
        showApiError(err)
        setError("Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  useEffect(() => {
    let filtered = events

    if (searchQuery) {
      filtered = filtered.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (categoryFilter) {
      filtered = filtered.filter((event) => event.category === categoryFilter)
    }

    setFilteredEvents(filtered)
  }, [events, searchQuery, categoryFilter])

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("q", value)
    } else {
      params.delete("q")
    }
    setSearchParams(params)
  }

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set("cat", value)
    } else {
      params.delete("cat")
    }
    setSearchParams(params)
  }

  const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean)))

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>Events</PageTitle>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>Events</PageTitle>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageTitle>Events</PageTitle>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1"
        />
        <Select value={categoryFilter || "all"} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                {event.category && <Badge variant="secondary">{event.category}</Badge>}
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm" asChild aria-label={`View details for ${event.title}`}>
                  <Link to={`/events/${event.id}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredEvents.length === 0 && !loading && (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No events found"
          description={
            searchQuery || categoryFilter
              ? "Try adjusting your search criteria or browse all events."
              : "There are no events available at the moment. Check back later!"
          }
          action={
            searchQuery || categoryFilter
              ? {
                  label: "Clear filters",
                  onClick: () => setSearchParams({}),
                }
              : undefined
          }
        />
      )}
    </PageContainer>
  )
}
