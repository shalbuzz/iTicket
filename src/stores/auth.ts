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
  isLoading: boolean
  isInitialized: boolean
  setToken: (token: string, user?: User) => void
  setUser: (user: User) => void
  logout: () => void
  initialize: () => void
  isAuthenticated: boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isLoading: false,
      isInitialized: false,
      get isAuthenticated() {
        return !!get().accessToken
      },

      initialize: () => {
        try {
          const token = localStorage.getItem("accessToken")
          const userData = localStorage.getItem("user")

          set({
            accessToken: token,
            user: userData ? JSON.parse(userData) : null,
            isInitialized: true,
          })
        } catch (error) {
          console.error("Failed to initialize auth:", error)
          set({
            accessToken: null,
            user: null,
            isInitialized: true,
          })
        }
      },

      setToken: (token: string, user?: User) => {
        localStorage.setItem("accessToken", token)
        if (user) {
          localStorage.setItem("user", JSON.stringify(user))
        }
        set({ accessToken: token, user: user || get().user })
      },

      setUser: (user: User) => {
        localStorage.setItem("user", JSON.stringify(user))
        set({ user })
      },

      logout: () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
        set({ accessToken: null, user: null })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
)
