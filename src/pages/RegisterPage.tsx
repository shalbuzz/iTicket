"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { register } from "../services/auth"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { Ticket, Eye, EyeOff, AlertCircle } from "../components/icons"
import { toast } from "@/hooks/use-toast"
import { showApiError } from "../lib/api-error"

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const navigate = useNavigate()

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!fullName.trim()) {
      errors.fullName = "Full name is required"
    } else if (fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters"
    }

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

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
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
      await register({ fullName: fullName.trim(), email, password })

      toast({
        title: "Account created successfully!",
        description: "Please sign in with your new account.",
      })

      navigate("/login")
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("An account with this email already exists. Please sign in instead.")
      } else if (err.response?.status === 422) {
        setError("Please check your information and try again.")
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
              <CardTitle className="text-2xl font-bold">Create account</CardTitle>
              <p className="text-muted-foreground mt-2">Join iTicket to start booking events</p>
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
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (fieldErrors.fullName) {
                      setFieldErrors((prev) => ({ ...prev, fullName: "" }))
                    }
                  }}
                  className={fieldErrors.fullName ? "border-destructive focus:border-destructive" : ""}
                  disabled={loading}
                />
                {fieldErrors.fullName && <p className="text-sm text-destructive">{fieldErrors.fullName}</p>}
              </div>

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
                    placeholder="Create a password"
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

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }))
                      }
                    }}
                    className={
                      fieldErrors.confirmPassword ? "border-destructive focus:border-destructive pr-10" : "pr-10"
                    }
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : "Create account"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
