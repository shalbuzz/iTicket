import type React from "react"
import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Toaster } from "./ui/toaster"

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl p-4 md:p-6">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
