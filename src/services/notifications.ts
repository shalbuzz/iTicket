import api from "../lib/api"

export interface NotificationDto {
  id: string
  userId: string
  channel: "Email" | "Sms" | "WebPush"
  subject: string
  body: string
  sent: boolean
  createdAt: string
  sentAt?: string | null
}
export type NotificationItem = NotificationDto

export const listNotifications = async (take?: number): Promise<NotificationDto[]> => {
  const { data } = await api.get("/notifications/mine", { params: take ? { take } : undefined })
  return data
}
