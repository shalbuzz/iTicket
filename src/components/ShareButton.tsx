"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Share2, Copy, MessageCircle, Mail } from "./icons"
import { toast } from "@/hooks/use-toast"

interface ShareButtonProps {
  title: string
  url?: string
  description?: string
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title, url, description }) => {
  const [loading, setLoading] = useState(false)
  const shareUrl = url || window.location.href

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({ title: "Link copied to clipboard!" })
    } catch (error) {
      toast({
        title: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (platform: string) => {
    setLoading(true)
    const text = `${title}${description ? ` - ${description}` : ""}`

    try {
      switch (platform) {
        case "native":
          if (navigator.share) {
            await navigator.share({ title, text, url: shareUrl })
          }
          break
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
          )
          break
        case "email":
          window.open(
            `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`,
          )
          break
      }
    } catch (error) {
      console.error("Share failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        {navigator.share && (
          <DropdownMenuItem onClick={() => handleShare("native")}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleShare("twitter")}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("email")}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
