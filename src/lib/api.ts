import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
})

// Request interceptor для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
