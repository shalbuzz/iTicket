"use client"

import type React from "react"
import { useAuth } from "../stores/auth"
import { useEffect, useState } from "react"

export const AuthDebug: React.FC = () => {
  const { isAuthenticated, user, accessToken, isInitialized } = useAuth()
  const [localToken, setLocalToken] = useState<string | null>(null)
  const [authDetails, setAuthDetails] = useState<any>({})

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    setLocalToken(token)

    const authStorage = localStorage.getItem("auth-storage")
    const parsedAuthStorage = authStorage ? JSON.parse(authStorage) : null

    setAuthDetails({
      localStorageToken: token,
      authStorageRaw: authStorage,
      authStorageParsed: parsedAuthStorage,
      storeAccessToken: accessToken,
      storeUser: user,
      isAuthenticatedResult: isAuthenticated(),
    })
  }, [accessToken, user, isAuthenticated])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-sm z-50 max-h-96 overflow-y-auto">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Initialized: {isInitialized ? "✅" : "❌"}</div>
      <div>Authenticated: {isAuthenticated() ? "✅" : "❌"}</div>
      <div>Store Token: {accessToken ? "✅" : "❌"}</div>
      <div>Local Token: {localToken ? "✅" : "❌"}</div>
      <div>User: {user?.email || "None"}</div>

      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="font-semibold mb-1">Details:</div>
        <div className="text-xs space-y-1">
          <div>Local: {authDetails.localStorageToken ? "✅" : "❌"}</div>
          <div>Store: {authDetails.storeAccessToken ? "✅" : "❌"}</div>
          <div>Auth Check: {authDetails.isAuthenticatedResult ? "✅" : "❌"}</div>
          {authDetails.authStorageParsed && (
            <div>Persist: {authDetails.authStorageParsed.state?.accessToken ? "✅" : "❌"}</div>
          )}
        </div>
      </div>

      <button
        onClick={() => {
          console.log("[v0] Auth Debug - Full State:", {
            store: useAuth.getState(),
            localStorage: {
              accessToken: localStorage.getItem("accessToken"),
              authStorage: localStorage.getItem("auth-storage"),
            },
          })
        }}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Log State
      </button>
    </div>
  )
}
