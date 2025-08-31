"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../stores/auth"
import { login } from "../services/auth"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { Ticket, Eye, EyeOff, AlertCircle } from "../components/icons"
import { toast } from "../hooks/use-toast"
import { showApiError } from "../lib/api-error"
import { Link } from "react-router-dom"

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { setToken } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await login({ email, password })

      if (response?.access) {
        localStorage.setItem("accessToken", response.access)
      } else {
        throw new Error("Invalid login response")
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account.",
      })

      navigate("/")
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.")
      } else if (err.response?.status === 429) {
        setError("Too many login attempts. Please wait a moment before trying again.")
      } else {
        showApiError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <p className="text-muted-foreground mt-2">Sign in to your iTicket account</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: "" }))
                    }
                  }}
                  className={fieldErrors.email ? "border-destructive focus:border-destructive" : ""}
                  disabled={loading}
                />
                {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: "" }))
                      }
                    }}
                    className={fieldErrors.password ? "border-destructive focus:border-destructive pr-10" : "pr-10"}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : "Sign in"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
