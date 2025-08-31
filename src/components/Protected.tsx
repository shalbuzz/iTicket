"use client"

import type React from "react"
import { Navigate } from "react-router-dom"

interface ProtectedProps {
  children: React.ReactNode
}

export const Protected: React.FC<ProtectedProps> = ({ children }) => {
  const token = localStorage.getItem("accessToken")

  if (!token || token === "undefined" || token === "null") {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
