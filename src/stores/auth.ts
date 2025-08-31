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
        set({ isInitialized: true })
      },

      setToken: (token: string, user?: User) => {
        localStorage.setItem("accessToken", token)
        if (user) {
          set({ accessToken: token, user })
        } else {
          set({ accessToken: token })
        }
      },

      setUser: (user: User) => {
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
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          localStorage.setItem("accessToken", state.accessToken)
        }
      },
    },
  ),
)
