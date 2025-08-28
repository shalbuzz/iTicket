"use client"

import type React from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-muted-foreground">{icon}</div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground max-w-sm">{description}</p>
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
