// src/stores/auth.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

type User = { id: string; email?: string; name?: string } | null

type AuthState = {
  accessToken: string | null
  user: User
  setToken: (token: string, user?: User) => void
  clear: () => void
  isAuthenticated: () => boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      setToken: (token, user) => {
        set({ accessToken: token, user: user ?? get().user })
      },

      clear: () => set({ accessToken: null, user: null }),

      isAuthenticated: () => {
        const t = get().accessToken
        return !!t && t !== "undefined" && t !== "null"
      },
    }),
    { name: "auth-storage" } // ключ в localStorage
  )
)
