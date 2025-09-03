"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { searchEvents, getCategories, type EventListItem, type EventSearchParams } from "../services/events"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Button } from "../components/ui/button"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
import { EmptyState } from "../components/EmptyState"
import { ErrorState } from "../components/ErrorState"
import { EventCard } from "../components/EventCard"
import { Skeleton } from "../components/ui/skeleton"
import { Search, Filter, Ticket, Calendar } from "../components/icons"
import { showApiError } from "../lib/api-error"

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventListItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [hasMore, setHasMore] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const searchQuery = searchParams.get("q") || ""
  const categoryFilter = searchParams.get("category") || ""
  const fromDate = searchParams.get("fromUtc") || ""
  const toDate = searchParams.get("toUtc") || ""

  const loadEvents = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true)
          setEvents([])
        } else {
          setLoadingMore(true)
        }

        const params: EventSearchParams = {
          take: 20,
          skip: reset ? 0 : events?.length || 0,
        }

        if (searchQuery) params.q = searchQuery
        if (categoryFilter) params.category = categoryFilter
        if (fromDate) params.fromUtc = fromDate
        if (toDate) params.toUtc = toDate

        const response = await searchEvents(params)

        if (reset) {
          setEvents(response.items || [])
        } else {
          setEvents((prev) => [...(prev || []), ...(response.items || [])])
        }

        setHasMore(response.hasMore)
        setError("")
      } catch (err: any) {
        showApiError(err)
        setError("Failed to load events")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [searchQuery, categoryFilter, fromDate, toDate, events?.length],
  )

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Failed to load categories:", err)
        setCategories([])
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    loadEvents(true)
  }, [searchQuery, categoryFilter, fromDate, toDate])

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
      params.set("category", value)
    } else {
      params.delete("category")
    }
    setSearchParams(params)
  }

  const handleFromDateChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("fromUtc", value)
    } else {
      params.delete("fromUtc")
    }
    setSearchParams(params)
  }

  const handleToDateChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("toUtc", value)
    } else {
      params.delete("toUtc")
    }
    setSearchParams(params)
  }

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>Discover Events</PageTitle>
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-full sm:w-48" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>Discover Events</PageTitle>
        <ErrorState message={error} onRetry={() => loadEvents(true)} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <PageTitle>Discover Amazing Events</PageTitle>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find and book tickets for concerts, theater shows, sports events, and more
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events, artists, venues..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter || "all"} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-48 h-12 pl-10 bg-background/50 border-border/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.isArray(categories) &&
                    categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="From date"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="To date"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(events || []).map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>

        {hasMore && (events?.length || 0) > 0 && (
          <div className="text-center">
            <Button
              onClick={() => loadEvents(false)}
              disabled={loadingMore}
              variant="outline"
              size="lg"
              className="min-w-32"
            >
              {loadingMore ? "Loading..." : "Show More"}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {(events?.length || 0) === 0 && !loading && (
          <EmptyState
            icon={<Ticket className="h-16 w-16 text-primary/40" />}
            title="No events found"
            description={
              searchQuery || categoryFilter || fromDate || toDate
                ? "Try adjusting your search criteria or browse all events."
                : "There are no events available at the moment. Check back later for exciting new events!"
            }
            action={
              searchQuery || categoryFilter || fromDate || toDate
                ? {
                    label: "Clear filters",
                    onClick: () => setSearchParams({}),
                  }
                : undefined
            }
          />
        )}
      </div>
    </PageContainer>
  )
}
