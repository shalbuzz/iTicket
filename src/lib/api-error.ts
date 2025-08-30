import { toast } from "@/hooks/use-toast"

export interface ApiError {
  title?: string
  message?: string
  status?: number
  code?: string
  details?: Record<string, any>
}

export const showApiError = (error: any) => {
  let title = "Error"
  let message = "Something went wrong"
  let status = 500

  if (error.response?.data) {
    const data = error.response.data
    title = data.title || data.error || getErrorTitleByStatus(error.response.status)
    message = data.message || data.detail || data.errors?.[0]?.message || message
    status = error.response.status
  } else if (error.request) {
    // Network error
    title = "Connection Error"
    message = "Unable to connect to the server. Please check your internet connection."
  } else if (error.message) {
    message = error.message
  }

  if (status === 401) {
    title = "Authentication Required"
    message = "Please sign in to continue."
  } else if (status === 403) {
    title = "Access Denied"
    message = "You don't have permission to perform this action."
  } else if (status === 404) {
    title = "Not Found"
    message = "The requested resource could not be found."
  } else if (status >= 500) {
    title = "Server Error"
    message = "Our servers are experiencing issues. Please try again later."
  }

  toast({
    variant: "destructive",
    title,
    description: message,
    duration: status >= 500 ? 8000 : 5000,
  })
}

function getErrorTitleByStatus(status: number): string {
  switch (status) {
    case 400:
      return "Invalid Request"
    case 401:
      return "Authentication Required"
    case 403:
      return "Access Denied"
    case 404:
      return "Not Found"
    case 409:
      return "Conflict"
    case 422:
      return "Validation Error"
    case 429:
      return "Too Many Requests"
    case 500:
      return "Server Error"
    case 502:
      return "Bad Gateway"
    case 503:
      return "Service Unavailable"
    default:
      return "Error"
  }
}
