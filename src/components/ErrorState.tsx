"use client"

import type React from "react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
import { AlertCircle, RefreshCw } from "./icons"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title = "Error", message, onRetry }) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 ml-0 bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
