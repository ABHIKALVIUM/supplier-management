"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginPage from "@/components/login-page"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)
      router.push("/suppliers")
    }
  }, [router])

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, remember }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setIsLoggedIn(true)
        router.push("/suppliers")
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.message || "Invalid credentials",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login",
      })
    }
  }

  return (
    <main className="min-h-screen">
      {!isLoggedIn && <LoginPage onLogin={handleLogin} />}
      <Toaster />
    </main>
  )
}

