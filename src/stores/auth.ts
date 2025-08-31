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
  isAuthenticated: () => boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isLoading: false,
      isInitialized: false,

      isAuthenticated: () => {
        const state = get()
        const storeToken = state.accessToken
        const localToken = localStorage.getItem("accessToken")
        const validToken =
          storeToken || (localToken && localToken !== "undefined" && localToken !== "null" ? localToken : null)
        return !!validToken
      },

      initialize: () => {
        console.log("[v0] Auth store initializing...")
        const localToken = localStorage.getItem("accessToken")
        const persistedData = localStorage.getItem("auth-storage")

        console.log("[v0] Local token:", localToken)
        console.log("[v0] Persisted data:", persistedData)

        if (localToken && localToken !== "undefined" && localToken !== "null") {
          console.log("[v0] Setting token from localStorage:", localToken)
          set({ accessToken: localToken, isInitialized: true })
        } else {
          console.log("[v0] No valid token found, initializing empty state")
          set({ isInitialized: true })
        }
      },

      setToken: (token: string, user?: User) => {
        console.log("[v0] setToken called with:", { token, user })

        // Save to localStorage first
        localStorage.setItem("accessToken", token)
        console.log("[v0] Token saved to localStorage")

        // Update Zustand state
        const newState: Partial<AuthState> = { accessToken: token }
        if (user) {
          newState.user = user
          localStorage.setItem("user", JSON.stringify(user))
        }

        set(newState)
        console.log("[v0] Auth state updated:", newState)

        // Verify the state was set
        setTimeout(() => {
          const currentState = get()
          console.log("[v0] Current auth state after setToken:", {
            accessToken: currentState.accessToken,
            user: currentState.user,
            isAuthenticated: currentState.isAuthenticated(),
          })
        }, 100)
      },

      setUser: (user: User) => {
        set({ user })
      },

      logout: () => {
        console.log("[v0] Logging out...")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
        localStorage.removeItem("auth-storage")
        set({ accessToken: null, user: null })
        console.log("[v0] Logout complete")
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        console.log("[v0] Rehydrating auth storage...")
        if (state) {
          console.log("[v0] Rehydrated state:", state)
          state.initialize()
        }
      },
    },
  ),
)

console.log("[v0] Creating auth store...")
useAuth.getState().initialize()
console.log("[v0] Auth store created and initialized")
