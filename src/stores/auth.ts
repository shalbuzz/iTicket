import { create } from "zustand"

interface AuthState {
  accessToken: string | null
  setToken: (token: string) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: localStorage.getItem("accessToken"),

  setToken: (token: string) => {
    localStorage.setItem("accessToken", token)
    set({ accessToken: token })
  },

  logout: () => {
    localStorage.removeItem("accessToken")
    set({ accessToken: null })
  },
}))
