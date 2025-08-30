"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Star } from "./icons"
import { addFavorite, removeFavorite } from "../services/favorites"
import { useAuth } from "../stores/auth"
import { toast } from "../hooks/use-toast"

interface FavoriteButtonProps {
  eventId: string
  isFavorite?: boolean
  onToggle?: (isFavorite: boolean) => void
  size?: "sm" | "md" | "lg"
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  eventId,
  isFavorite = false,
  onToggle,
  size = "md",
}) => {
  const [favorite, setFavorite] = useState(isFavorite)
  const [loading, setLoading] = useState(false)
  const { accessToken } = useAuth()

  const handleToggle = async () => {
    if (!accessToken) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      if (favorite) {
        await removeFavorite(eventId)
        setFavorite(false)
        toast({ title: "Removed from favorites" })
      } else {
        await addFavorite(eventId)
        setFavorite(true)
        toast({ title: "Added to favorites" })
      }
      onToggle?.(favorite)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={`${sizeClasses[size]} hover:bg-secondary/20 transition-colors`}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
    >
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Star
          className={`h-5 w-5 transition-colors ${
            favorite ? "fill-secondary text-secondary" : "text-muted-foreground hover:text-secondary"
          }`}
        />
      </motion.div>
    </Button>
  )
}
