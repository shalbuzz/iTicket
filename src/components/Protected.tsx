"use client"

import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../stores/auth"

export const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = useAuth((s) => s.isAuthenticated())
  if (!isAuth) return <Navigate to="/login" replace />
  return <>{children}</>
}
