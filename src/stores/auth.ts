import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name?: string
}

interface AuthState {
  accessToken: string | null
  user: User | null
  setToken: (token: string, user?: User) => void
  clear: () => void
  isAuthenticated: () => boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      setToken: (token: string, user?: User) => {
        localStorage.setItem("accessToken", token)
        set({ accessToken: token, user })
      },

      clear: () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("auth-storage")
        set({ accessToken: null, user: null })
      },

      isAuthenticated: () => {
        const state = get()
        return !!state.accessToken
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
