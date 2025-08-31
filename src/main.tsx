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
import { FavoritesPage } from "./pages/FavoritesPage"
import { NotificationsPage } from "./pages/NotificationsPage"
import { useAuth } from "./stores/auth"

const App = () => {
  const { initialize } = useAuth()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        <Route key="login" path="/login" element={<LoginPage />} />
        <Route key="register" path="/register" element={<RegisterPage />} />
        <Route key="layout" path="/" element={<Layout />}>
          <Route key="home" index element={<EventsPage />} />
          <Route key="event-detail" path="events/:id" element={<EventPage />} />
          <Route
            key="cart"
            path="cart"
            element={
              <Protected>
                <CartPage />
              </Protected>
            }
          />
          <Route
            key="checkout"
            path="checkout"
            element={
              <Protected>
                <CheckoutPage />
              </Protected>
            }
          />
          <Route
            key="orders"
            path="orders"
            element={
              <Protected>
                <OrdersPage />
              </Protected>
            }
          />
          <Route
            key="favorites"
            path="favorites"
            element={
              <Protected>
                <FavoritesPage />
              </Protected>
            }
          />
          <Route
            key="notifications"
            path="notifications"
            element={
              <Protected>
                <NotificationsPage />
              </Protected>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
