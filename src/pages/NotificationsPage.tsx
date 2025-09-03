"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { listNotifications, type NotificationItem } from "../services/notifications"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { PageTitle } from "../components/PageTitle"
import { PageContainer } from "../components/PageContainer"
import { LoadingState } from "../components/LoadingState"
import { EmptyState } from "../components/EmptyState"
import { ErrorState } from "../components/ErrorState"
import { Bell, Mail, Clock, CheckCircle } from "../components/icons"
import { showApiError } from "../lib/api-error"

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        const data = await listNotifications()
        setNotifications(data)
        setError("")
      } catch (err: any) {
        setError("Failed to load notifications")
        showApiError(err)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>Notifications</PageTitle>
        <LoadingState text="Loading notifications..." />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle>Notifications</PageTitle>
        <ErrorState message={error} onRetry={() => window.location.reload()} showCard />
      </PageContainer>
    )
  }

  if (notifications.length === 0) {
    return (
      <PageContainer>
        <PageTitle>Notifications</PageTitle>
        <EmptyState
          icon={<Bell className="h-16 w-16 text-primary/40" />}
          title="No notifications"
          description="You're all caught up! New notifications will appear here when you have them."
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageTitle>Notifications</PageTitle>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {notification.sentAt ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{notification.subject}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                    </div>
                  </div>
                  <Badge variant={notification.sentAt ? "default" : "secondary"}>
                    {notification.sentAt ? "Sent" : "Queued"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Created: {new Date(notification.createdAt).toLocaleString()}</span>
                  </div>
                  {notification.sentAt && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>Sent: {new Date(notification.sentAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </PageContainer>
  )
}
