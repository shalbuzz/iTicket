import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
})

// Helper function to properly validate tokens
function getToken(): string | null {
  const raw = localStorage.getItem("accessToken")
  // Filter out garbage values that might be stored
  if (!raw || raw === "undefined" || raw === "null") return null
  return raw
}

// Request interceptor для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = getToken()

    // Don't add token to auth endpoints
    const url = (config.url ?? "").toLowerCase()
    const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh")

    config.headers = config.headers ?? {}

    if (!isAuthRoute && token) {
      ;(config.headers as any).Authorization = `Bearer ${token}`
    } else {
      // Remove Authorization header for auth routes
      delete (config.headers as any).Authorization
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor для обработки 401 ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("accessToken")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
