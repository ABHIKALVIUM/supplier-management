"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { Search, Eye, Edit, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"

interface Supplier {
  _id: string
  vendorName: string
  companyName: string
  mobileNumber: string
  email: string
  gstinNumber: string
  panNumber: string
  status: "Active" | "Inactive"
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    fetchSuppliers()
  }, [currentPage, rowsPerPage, router])

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/suppliers?page=${currentPage}&limit=${rowsPerPage}&search=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers")
      }

      const data = await response.json()
      setSuppliers(data.suppliers)
      setTotalPages(Math.ceil(data.total / rowsPerPage))
      setIsLoading(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load suppliers",
      })
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchSuppliers()
  }

  const handleAddSupplier = () => {
    router.push("/suppliers/add")
  }

  const handleExport = async () => {
    try {
      const response = await fetch("/api/suppliers/export", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export suppliers")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "suppliers.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export Successful",
        description: "Suppliers data has been exported",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export suppliers data",
      })
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <form onSubmit={handleSearch} className="relative w-full max-w-md">
              <Input
                type="text"
                placeholder="Search By Company name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </form>
            <div className="flex space-x-2">
              <Button onClick={handleAddSupplier} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
              <Button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Export
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-indigo-500 text-left text-xs font-medium text-white uppercase tracking-wider">
                      ACTION
                    </th>
                    <th className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-400 text-left text-xs font-medium text-white uppercase tracking-wider">
                      VENDOR NAME
                    </th>
                    <th className="px-6 py-3 bg-gradient-to-r from-indigo-400 to-indigo-300 text-left text-xs font-medium text-white uppercase tracking-wider">
                      COMPANY NAME
                    </th>
                    <th className="px-6 py-3 bg-gradient-to-r from-indigo-300 to-amber-300 text-left text-xs font-medium text-white uppercase tracking-wider">
                      MOBILE NUMBER
                    </th>
                    <th className="px-6 py-3 bg-gradient-to-r from-amber-300 to-amber-400 text-left text-xs font-medium text-white uppercase tracking-wider">
                      EMAIL
                    </th>
                    <th className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-left text-xs font-medium text-white uppercase tracking-wider">
                      GSTIN NUMBER
                    </th>
                    <th className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-left text-xs font-medium text-white uppercase tracking-wider">
                      PAN NUMBER
                    </th>
                    <th className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-left text-xs font-medium text-white uppercase tracking-wider">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center">
                        No suppliers found
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((supplier) => (
                      <tr key={supplier._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => router.push(`/suppliers/${supplier._id}`)}
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => router.push(`/suppliers/${supplier._id}/edit`)}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{supplier.vendorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{supplier.companyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {supplier.mobileNumber || supplier.primaryPhone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {supplier.email || supplier.primaryEmail || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {supplier.gstinNumber || supplier.gstNumber || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{supplier.panNumber || supplier.pan || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              supplier.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {supplier.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 rounded-md text-sm p-1"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  {suppliers.length > 0
                    ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                        currentPage * rowsPerPage,
                        (totalPages - 1) * rowsPerPage + suppliers.length,
                      )} of ${(totalPages - 1) * rowsPerPage + suppliers.length}`
                    : "0-0 of 0"}
                </span>
                <div className="ml-4 flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
                  >
                    {"<<"}
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
                  >
                    {"<"}
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
                  >
                    {">"}
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
                  >
                    {">>"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="mt-auto bg-purple-800 text-white text-center py-3">
          Copyright © 2023 Digielves Tech Wizards Private Limited. All rights reserved
        </footer>
      </div>
    </div>
  )
}

