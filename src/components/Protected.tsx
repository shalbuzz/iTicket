"use client"

import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../stores/auth"
import { useEffect, useState } from "react"

interface ProtectedProps {
  children: React.ReactNode
}

export const Protected: React.FC<ProtectedProps> = ({ children }) => {
  const { isAuthenticated, initialize, isInitialized } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isInitialized) {
        initialize()
      }

      setTimeout(() => {
        setIsChecking(false)
      }, 100)
    }

    checkAuth()
  }, [isInitialized, initialize])

  if (isChecking || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log("[v0] Protected: User not authenticated, redirecting to login")
    return <Navigate to="/login" replace />
  }

  console.log("[v0] Protected: User authenticated, rendering children")
  return <>{children}</>
}
