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
        const storeToken = get().accessToken
        const localToken = localStorage.getItem("accessToken")
        const validToken =
          storeToken || (localToken && localToken !== "undefined" && localToken !== "null" ? localToken : null)
        return !!validToken
      },

      initialize: () => {
        const localToken = localStorage.getItem("accessToken")
        if (localToken && localToken !== "undefined" && localToken !== "null") {
          set({ accessToken: localToken, isInitialized: true })
        } else {
          set({ isInitialized: true })
        }
      },

      setToken: (token: string, user?: User) => {
        localStorage.setItem("accessToken", token)
        const newState: Partial<AuthState> = { accessToken: token }
        if (user) {
          newState.user = user
        }
        set(newState)

        setTimeout(() => {
          set((state) => ({ ...state }))
        }, 0)
      },

      setUser: (user: User) => {
        set({ user })
      },

      logout: () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
        localStorage.removeItem("auth-storage")
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
        if (state?.accessToken && state.accessToken !== "undefined" && state.accessToken !== "null") {
          localStorage.setItem("accessToken", state.accessToken)
        }
      },
    },
  ),
)
