"use client"

import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./index.css"

import { Layout } from "./components/Layout"
import { Protected } from "./components/Protected"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { EventsPage } from "./pages/EventsPage"
import { EventPage } from "./pages/EventPage"
import { CartPage } from "./pages/CartPage"
import { CheckoutPage } from "./pages/CheckoutPage"
import { OrdersPage } from "./pages/OrdersPage"
import { OrderDetailsPage } from "./pages/OrderDetailsPage"
import { FavoritesPage } from "./pages/FavoritesPage"
import { NotificationsPage } from "./pages/NotificationsPage"
import { useAuth } from "./stores/auth"

const cleanupTokens = () => {
  const badToken = localStorage.getItem("accessToken")
  if (badToken === "undefined" || badToken === "null" || badToken === "") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("auth-storage")
  }
}

cleanupTokens()

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => (window.location.href = "/")}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Go Home
      </button>
    </div>
  </div>
)

const App = () => {
  const { initialize } = useAuth()

  useEffect(() => {
    console.log("[v0] App: Initializing auth...")
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<EventsPage />} />
          <Route path="events/:id" element={<EventPage />} />
          <Route
            path="cart"
            element={
              <Protected>
                <CartPage />
              </Protected>
            }
          />
          <Route
            path="checkout"
            element={
              <Protected>
                <CheckoutPage />
              </Protected>
            }
          />
          <Route
            path="orders"
            element={
              <Protected>
                <OrdersPage />
              </Protected>
            }
          />
          <Route
            path="orders/:id"
            element={
              <Protected>
                <OrderDetailsPage />
              </Protected>
            }
          />
          <Route
            path="favorites"
            element={
              <Protected>
                <FavoritesPage />
              </Protected>
            }
          />
          <Route
            path="notifications"
            element={
              <Protected>
                <NotificationsPage />
              </Protected>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
