"use client"

import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useAuth } from "../stores/auth"
import { useCart } from "../stores/cart"
import { useTheme } from "../hooks/use-theme"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Ticket, Home, ShoppingCart, Bell, Star, LogIn, LogOut, Menu, Moon, Sun } from "./icons"

export const Header: React.FC = () => {
  const isAuth = useAuth((s) => s.isAuthenticated())
  const user = useAuth((s) => s.user)
  const clearAuth = useAuth((s) => s.clear)
  const navigate = useNavigate()

  const { count: cartCount, refresh: refreshCart } = useCart()
  const { theme, toggleTheme } = useTheme()

  // При успешной авторизации — подтянуть корзину
  useEffect(() => {
    if (isAuth) {
      refreshCart().catch(() => {})
    }
  }, [isAuth, refreshCart])

  const handleLogout = () => {
    clearAuth()
    navigate("/login", { replace: true })
  }

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/", label: "Events", icon: Ticket }, // при желании вынеси на /events
    { to: "/cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { to: "/orders", label: "Orders", icon: ShoppingCart },
    { to: "/favorites", label: "Favorites", icon: Star },
    { to: "/notifications", label: "Notifications", icon: Bell, badge: 0 },
  ]

  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">iTicket</span>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, label, icon: Icon, badge }) => (
              <Button key={to} variant="ghost" asChild className="relative">
                <Link to={to} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                      {badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navLinks.map(({ to, label, icon: Icon, badge }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link to={to} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                      {badge !== undefined && badge > 0 && (
                        <Badge variant="secondary" className="ml-auto h-5 min-w-[20px] text-xs">
                          {badge}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {isAuth ? (
              <div className="flex items-center space-x-2">
                {user?.name && (
                  <span className="text-sm text-muted-foreground hidden sm:inline">Hello, {user.name}</span>
                )}
                <Button onClick={handleLogout} variant="ghost" aria-label="Logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link to="/login" className="flex items-center space-x-2" aria-label="Login">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
