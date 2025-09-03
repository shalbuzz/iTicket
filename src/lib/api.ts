import axios from "axios"

const base = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")
const api = axios.create({ baseURL: base })

function getTokenFromPersist(): string | null {
  const raw = localStorage.getItem("auth-storage")
  if (!raw) return null
  try {
    const t = JSON.parse(raw)?.state?.accessToken
    if (!t || typeof t !== "string") return null
    const v = t.trim()
    return v && v !== "undefined" && v !== "null" ? v : null
  } catch {
    return null
  }
}

api.interceptors.request.use((cfg) => {
  const url = (cfg.url ?? "").toLowerCase()
  const isAuth = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh")
  cfg.headers = cfg.headers ?? {}
  if (!isAuth) {
    const token = getTokenFromPersist()
    if (token) (cfg.headers as any).Authorization = `Bearer ${token}`
    else delete (cfg.headers as any).Authorization
  } else {
    delete (cfg.headers as any).Authorization
  }
  return cfg
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status
    const url = (err?.config?.url ?? "").toLowerCase()
    const isAuth = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh")
    if (status === 401 && !isAuth && location.pathname !== "/login") {
      localStorage.removeItem("auth-storage")
      window.location.assign("/login")
    }
    return Promise.reject(err)
  },
)

export default api
