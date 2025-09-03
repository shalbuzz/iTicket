"use client"

import React, { useState } from "react"
import { addFavorite, removeFavorite } from "../services/favorites"
import { Star } from "./icons" // если нет icons.ts — убери импорт и иконку

// простая проверка GUID
const isGuid = (s?: string) =>
  !!s && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(s)

type Props = {
  eventId: string | undefined
  isFavorite?: boolean
  size?: "sm" | "md"
  onChange?: (next: boolean) => void
}

export const FavoriteButton: React.FC<Props> = ({ eventId, isFavorite = false, size = "md", onChange }) => {
  const [busy, setBusy] = useState(false)
  const [fav, setFav] = useState(!!isFavorite)

  const canUse = isGuid(eventId)
  const dim = size === "sm" ? "h-8 px-3 py-1.5 text-xs" : "h-9 px-4 py-2 text-sm"

  async function handleClick() {
    if (!canUse || busy) return
    setBusy(true)
    try {
      if (fav) {
        await removeFavorite(eventId!)
        setFav(false)
        onChange?.(false)
      } else {
        // addFavorite игнорит 409 (уже в избранном)
        await addFavorite(eventId!)
        setFav(true)
        onChange?.(true)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canUse || busy}
      className={`inline-flex items-center gap-1 rounded-xl border ${dim} transition
        ${fav ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "hover:bg-muted"}
        ${!canUse ? "opacity-50 cursor-not-allowed" : ""}
      `}
      aria-pressed={fav}
      title={!canUse ? "Invalid id" : fav ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className="h-4 w-4" />
      {fav ? "In favorites" : "Add to favorites"}
    </button>
  )
}

export default FavoriteButton
