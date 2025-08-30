"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { AlertCircle, RefreshCw, Wifi, Server, Shield, Search } from "./icons"

interface ErrorStateProps {
  title?: string
  message: string
  type?: "network" | "server" | "auth" | "notfound" | "generic"
  onRetry?: () => void
  retryLabel?: string
  showCard?: boolean
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  type = "generic",
  onRetry,
  retryLabel = "Try Again",
  showCard = false,
  className,
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case "network":
        return <Wifi className="h-12 w-12 text-destructive/60" />
      case "server":
        return <Server className="h-12 w-12 text-destructive/60" />
      case "auth":
        return <Shield className="h-12 w-12 text-destructive/60" />
      case "notfound":
        return <Search className="h-12 w-12 text-destructive/60" />
      default:
        return <AlertCircle className="h-12 w-12 text-destructive/60" />
    }
  }

  const getDefaultTitle = () => {
    if (title) return title

    switch (type) {
      case "network":
        return "Connection Problem"
      case "server":
        return "Server Error"
      case "auth":
        return "Authentication Required"
      case "notfound":
        return "Not Found"
      default:
        return "Something went wrong"
    }
  }

  const content = (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={className}>
      {showCard ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 text-center space-y-4">
            {getErrorIcon()}
            <div>
              <h3 className="text-lg font-semibold text-destructive mb-2">{getDefaultTitle()}</h3>
              <p className="text-muted-foreground">{message}</p>
            </div>
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="border-destructive/20 hover:bg-destructive/10 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryLabel}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{getDefaultTitle()}</AlertTitle>
          <AlertDescription className="mt-2">
            {message}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3 ml-0 bg-transparent border-destructive/20 hover:bg-destructive/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryLabel}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </motion.div>
  )

  return content
}
