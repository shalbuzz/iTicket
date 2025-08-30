"use client"

import type React from "react"
import { motion } from "framer-motion"
import { LoadingSpinner } from "./LoadingSpinner"
import { Card, CardContent } from "./ui/card"

interface LoadingStateProps {
  text?: string
  fullPage?: boolean
  className?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ text = "Loading...", fullPage = false, className }) => {
  const content = (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={className}>
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <LoadingSpinner size="lg" text={text} />
        </CardContent>
      </Card>
    </motion.div>
  )

  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>
  }

  return content
}
