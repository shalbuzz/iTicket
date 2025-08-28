import { toast } from "@/hooks/use-toast"

export interface ApiError {
  title?: string
  message?: string
  status?: number
}

export const showApiError = (error: any) => {
  let title = "Error"
  let message = "Something went wrong"

  if (error.response?.data) {
    const data = error.response.data
    title = data.title || data.error || title
    message = data.message || data.detail || message
  } else if (error.message) {
    message = error.message
  }

  toast({
    variant: "destructive",
    title,
    description: message,
  })
}
