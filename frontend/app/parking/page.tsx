"use client"
import Sidebar from "@/components/sidebar"
import NoDataFound from "@/components/no-data-found"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ParkingPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    }
  }, [router])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="p-6 flex-1">
          <NoDataFound />
        </div>
        <footer className="mt-auto bg-purple-800 text-white text-center py-3">
          Copyright © 2023 Digielves Tech Wizards Private Limited. All rights reserved
        </footer>
      </div>
    </div>
  )
}

