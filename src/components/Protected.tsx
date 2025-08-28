"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../stores/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"

interface ProtectedProps {
  children: React.ReactNode
}

export const Protected: React.FC<ProtectedProps> = ({ children }) => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(!accessToken)

  if (!accessToken) {
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
            <DialogTitle>Please sign in</DialogTitle>
            <DialogDescription>You need to be signed in to access this page.</DialogDescription>
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
