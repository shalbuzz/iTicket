"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../stores/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"

interface ProtectedProps {
  children: React.ReactNode
}

export const Protected: React.FC<ProtectedProps> = ({ children }) => {
  const { isAuthenticated, isInitialized, initialize } = useAuth()
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setShowDialog(true)
    }
  }, [isInitialized, isAuthenticated])

  // Show loading skeleton while initializing
  if (!isInitialized) {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) {
            navigate("/login")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              Please sign in to access this page. You'll be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => navigate("/login")}>Go to login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return <>{children}</>
}
