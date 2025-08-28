"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { listNotifications, type NotificationItem } from "../services/notifications"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../components/ui/badge"

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await listNotifications()
        setNotifications(data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading notifications...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">No notifications found</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{notification.subject}</CardTitle>
                  <Badge variant={notification.sentAt ? "default" : "secondary"}>
                    {notification.sentAt ? "sent" : "queued"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">{notification.body}</p>
                <div className="text-sm text-gray-500">
                  Created: {new Date(notification.createdAt).toLocaleString()}
                  {notification.sentAt && (
                    <span className="ml-4">Sent: {new Date(notification.sentAt).toLocaleString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
