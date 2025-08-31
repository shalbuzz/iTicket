"use client"

import type React from "react"
import { useAuth } from "../stores/auth"
import { useEffect, useState } from "react"

export const AuthDebug: React.FC = () => {
  const { isAuthenticated, user, accessToken, isInitialized } = useAuth()
  const [localToken, setLocalToken] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    setLocalToken(token)
  }, [])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Initialized: {isInitialized ? "✅" : "❌"}</div>
      <div>Authenticated: {isAuthenticated ? "✅" : "❌"}</div>
      <div>Store Token: {accessToken ? "✅" : "❌"}</div>
      <div>Local Token: {localToken ? "✅" : "❌"}</div>
      <div>User: {user?.email || "None"}</div>
    </div>
  )
}
