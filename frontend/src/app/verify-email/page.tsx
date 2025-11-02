"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react"
import { verifyEmail, resendVerification } from "@/api/api"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (token) {
      handleVerification(token)
    }
  }, [token])

  const handleVerification = async (verificationToken: string) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await verifyEmail(verificationToken)
      setIsVerified(true)
      toast({
        title: "Success",
        description: response.message || "Email verified successfully!",
      })
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Verification failed. The token may be invalid or expired."
      setError(errorMsg)
      toast({
        title: "Verification Failed",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)
    try {
      const response = await resendVerification(email)
      toast({
        title: "Success",
        description: response.message || "Verification email sent!",
      })
      setError("")
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Failed to resend verification email"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-background px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">RC</span>
            </div>
            <span className="text-2xl font-bold">ResearchConnect</span>
          </div>
          <h1 className="text-3xl font-bold">Verify Email</h1>
          <p className="text-muted-foreground mt-2">
            {token ? "Verifying your email address..." : "Enter your email to resend verification link"}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </div>
        )}

        {/* Success State */}
        {isVerified && !isLoading && (
          <div className="flex flex-col items-center gap-4 p-8 bg-green-50 border border-green-300 rounded-lg">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <div className="text-center">
              <p className="font-semibold text-green-800 text-lg">Email Verified!</p>
              <p className="text-sm text-green-700 mt-2">
                Your email has been successfully verified. Redirecting to login...
              </p>
            </div>
            <Button
              onClick={() => router.push("/login")}
              className="mt-2"
            >
              Go to Login
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && !isVerified && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Verification Failed</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resend Verification Form */}
        {!token && !isLoading && (
          <form onSubmit={handleResendVerification} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isResending}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-primary hover:underline"
              >
                Back to Login
              </button>
            </p>
          </form>
        )}

        {/* Show resend option when verification fails */}
        {error && token && !isLoading && !isVerified && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Need a new verification link?
            </p>
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isResending}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                variant="outline"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
