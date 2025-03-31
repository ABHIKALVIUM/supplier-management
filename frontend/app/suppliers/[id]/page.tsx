"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"
import { Pencil, ArrowLeft } from "lucide-react"

interface Supplier {
  _id: string
  companyName: string
  vendorName: string
  primaryPhone: string
  secondaryPhone: string
  primaryEmail: string
  secondaryEmail: string
  pan: string
  supplierType: string
  category: string
  website: string
  gstNumber: string
  addressLine1: string
  addressLine2: string
  district: string
  city: string
  state: string
  pincode: string
  country: string
  accountName: string
  accountNumber: string
  bankBranchName: string
  ifscCode: string
  status: "Active" | "Inactive"
  notes: string
  attachments: Array<{
    name: string
    url: string
  }>
}

export default function ViewSupplierPage() {
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const supplierId = params.id as string

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    fetchSupplier()
  }, [supplierId])

  const fetchSupplier = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch supplier")
      }

      const data = await response.json()
      setSupplier(data.supplier)
      setIsLoading(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load supplier details",
      })
      setIsLoading(false)
    }
  }

  const handleEditClick = () => {
    router.push(`/suppliers/${supplierId}/edit`)
  }

  const handleBackClick = () => {
    router.push("/suppliers")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex justify-center items-center h-full">
              <p>Loading supplier details...</p>
            </div>
          </div>
          <footer className="mt-auto bg-purple-800 text-white text-center py-3">
            Copyright © 2023 Digielves Tech Wizards Private Limited. All rights reserved
          </footer>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex justify-center items-center h-full">
              <p>Supplier not found</p>
            </div>
          </div>
          <footer className="mt-auto bg-purple-800 text-white text-center py-3">
            Copyright © 2023 Digielves Tech Wizards Private Limited. All rights reserved
          </footer>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 via-amber-500 to-amber-600 p-4 text-white flex items-center">
          <Button
            onClick={handleBackClick}
            variant="ghost"
            className="text-white hover:bg-white/20 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-semibold flex-1 text-center pr-24">Supplier Details</h1>
        </div>
        
        <div className="p-6 flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Company Details</h2>
              <Button onClick={handleEditClick} variant="outline" className="flex items-center gap-2">
                <Pencil className="h-4 w-4" /> Edit Details
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm font-medium">Company Name :</p>
                  <p className="text-sm">{supplier.companyName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Vendor Name :</p>
                  <p className="text-sm">{supplier.vendorName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Primary Phone :</p>
                  <p className="text-sm">{supplier.primaryPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Secondary Phone :</p>
                  <p className="text-sm">{supplier.secondaryPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Primary Email :</p>
                  <p className="text-sm">{supplier.primaryEmail || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Secondary Email :</p>
                  <p className="text-sm">{supplier.secondaryEmail || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">PAN :</p>
                  <p className="text-sm">{supplier.pan || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Supplier Type :</p>
                  <p className="text-sm">{supplier.supplierType || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Category :</p>
                  <p className="text-sm">{supplier.category || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Website :</p>
                  <p className="text-sm">{supplier.website || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">GST Number :</p>
                  <p className="text-sm">{supplier.gstNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status :</p>
                  <p className="text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        supplier.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Supplier Location Details</h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm font-medium">Address :</p>
                  <p className="text-sm">
                    {supplier.addressLine1
                      ? `${supplier.addressLine1}${supplier.addressLine2 ? `, ${supplier.addressLine2}` : ""}`
                      : "-"}
                  </p>
                </div>
                <div className="md:col-span-2"></div>
                <div>
                  <p className="text-sm font-medium">District :</p>
                  <p className="text-sm">{supplier.district || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">City :</p>
                  <p className="text-sm">{supplier.city || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">State :</p>
                  <p className="text-sm">{supplier.state || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Pin code :</p>
                  <p className="text-sm">{supplier.pincode || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Country :</p>
                  <p className="text-sm">{supplier.country || "-"}</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Supplier Bank Details</h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm font-medium">Account Name :</p>
                  <p className="text-sm">{supplier.accountName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Account Number :</p>
                  <p className="text-sm">{supplier.accountNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Bank & Branch Name :</p>
                  <p className="text-sm">{supplier.bankBranchName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">IFSC :</p>
                  <p className="text-sm">{supplier.ifscCode || "-"}</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Additional Info</h2>
            <div className="border-t border-gray-200 pt-4">
              <div>
                <p className="text-sm font-medium">Notes :</p>
                <p className="text-sm">{supplier.notes || "-"}</p>
              </div>
            </div>

            {supplier.attachments && supplier.attachments.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-4">Attachments</h2>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {supplier.attachments.map((attachment, index) => (
                      <div key={index} className="border rounded-md p-3">
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <footer className="mt-auto bg-purple-800 text-white text-center py-3">
          Copyright © 2023 Digielves Tech Wizards Private Limited. All rights reserved
        </footer>
      </div>
    </div>
  )
}