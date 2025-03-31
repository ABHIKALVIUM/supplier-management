"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Sidebar from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"

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

export default function EditSupplierPage() {
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<Array<{ name: string; url: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setExistingAttachments(data.supplier.attachments || [])
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSupplier((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [name]: value,
      }
    })
  }

  const handleStatusChange = (checked: boolean) => {
    setSupplier((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        status: checked ? "Active" : "Inactive",
      }
    })
  }

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "")
    setSupplier((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [name]: numericValue,
      }
    })
  }

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplier) return

    setIsSubmitting(true)

    try {
      // First, upload any new files
      const uploadedFiles = []
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData()
          formData.append("file", file)

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${file.name}`)
          }

          const uploadData = await uploadResponse.json()
          uploadedFiles.push({
            name: file.name,
            url: uploadData.url,
          })
        }
      }

      // Map the supplier data to match the backend structure
      const supplierData = {
        companyName: supplier.companyName,
        vendorName: supplier.vendorName,
        mobileNumber: supplier.primaryPhone,
        email: supplier.primaryEmail,
        secondaryEmail: supplier.secondaryEmail,
        secondaryPhone: supplier.secondaryPhone,
        panNumber: supplier.pan,
        gstinNumber: supplier.gstNumber,
        supplierType: supplier.supplierType,
        category: supplier.category,
        website: supplier.website,
        addressLine1: supplier.addressLine1,
        addressLine2: supplier.addressLine2,
        district: supplier.district,
        city: supplier.city,
        state: supplier.state,
        pincode: supplier.pincode,
        country: supplier.country,
        accountName: supplier.accountName,
        accountNumber: supplier.accountNumber,
        bankBranchName: supplier.bankBranchName,
        ifscCode: supplier.ifscCode,
        status: supplier.status,
        notes: supplier.notes,
        attachments: [...existingAttachments, ...uploadedFiles],
      }

      // Then update the supplier with all data including attachments
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(supplierData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update supplier")
      }

      toast({
        title: "Success",
        description: "Supplier updated successfully",
      })
      router.push(`/suppliers/${supplierId}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update supplier",
      })
    } finally {
      setIsSubmitting(false)
    }
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
        <div className="bg-gradient-to-r from-indigo-600 via-amber-500 to-amber-600 p-4 text-white text-center text-xl font-semibold">
          Edit Supplier
        </div>

        <div className="p-6 flex-1 overflow-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <div className="border-b border-gray-300 pb-4 mb-6">
              <h2 className="text-xl font-semibold text-center">Company Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Company Name: <span className="text-red-500">*</span>
                </label>
                <Input
                  name="companyName"
                  value={supplier.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Vendor Name: <span className="text-red-500">*</span>
                </label>
                <Input
                  name="vendorName"
                  value={supplier.vendorName}
                  onChange={handleChange}
                  placeholder="Vendor Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Primary Phone:</label>
                <Input
                  name="primaryPhone"
                  value={supplier.primaryPhone}
                  onChange={handleNumberInput}
                  placeholder="Phone"
                  type="tel"
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Secondary Phone:</label>
                <Input
                  name="secondaryPhone"
                  value={supplier.secondaryPhone}
                  onChange={handleNumberInput}
                  placeholder="Secondary Phone"
                  type="tel"
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Primary Email: <span className="text-red-500">*</span>
                </label>
                <Input
                  name="primaryEmail"
                  value={supplier.primaryEmail}
                  onChange={handleChange}
                  placeholder="Primary Email"
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Secondary Email:</label>
                <Input
                  name="secondaryEmail"
                  value={supplier.secondaryEmail}
                  onChange={handleChange}
                  placeholder="Secondary Email"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">PAN:</label>
                <Input name="pan" value={supplier.pan} onChange={handleChange} placeholder="PAN" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Select Supplier Type:</label>
                <select
                  name="supplierType"
                  value={supplier.supplierType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Supplier Type</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Service Provider">Service Provider</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Select Category:</label>
                <select
                  name="category"
                  value={supplier.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="IT Services">IT Services</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Website:</label>
                <Input
                  name="website"
                  value={supplier.website}
                  onChange={handleChange}
                  placeholder="Enter Website URL"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">GST Number:</label>
                <Input
                  name="gstNumber"
                  value={supplier.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter GST Number"
                />
              </div>

              <div className="space-y-2 flex items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Inactive</span>
                  <Switch checked={supplier.status === "Active"} onCheckedChange={handleStatusChange} />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-300 pb-4 mb-6">
              <h2 className="text-xl font-semibold text-center">Additional INFO</h2>
            </div>

            <div className="mb-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Note:</label>
                <Textarea
                  name="notes"
                  value={supplier.notes || ""}
                  onChange={handleChange}
                  placeholder="Enter notes here"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="border-b border-gray-300 pb-4 mb-6">
              <h2 className="text-xl font-semibold text-center">Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Address Line 1:</label>
                <Input
                  name="addressLine1"
                  value={supplier.addressLine1}
                  onChange={handleChange}
                  placeholder="Address"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Address Line 2:</label>
                <Input
                  name="addressLine2"
                  value={supplier.addressLine2}
                  onChange={handleChange}
                  placeholder="Address"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">District:</label>
                <Input name="district" value={supplier.district} onChange={handleChange} placeholder="District" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">City:</label>
                <Input name="city" value={supplier.city} onChange={handleChange} placeholder="Enter City" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">State:</label>
                <Input name="state" value={supplier.state} onChange={handleChange} placeholder="Enter State" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Pincode:</label>
                <Input
                  name="pincode"
                  value={supplier.pincode}
                  onChange={handleNumberInput}
                  placeholder="Enter Pincode"
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Enter Country:</label>
                <Input name="country" value={supplier.country} onChange={handleChange} placeholder="Country" />
              </div>
            </div>

            <div className="border-b border-gray-300 pb-4 mb-6">
              <h2 className="text-xl font-semibold text-center">Bank Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Account Name:</label>
                <Input
                  name="accountName"
                  value={supplier.accountName}
                  onChange={handleChange}
                  placeholder="Enter Account Name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Account Number:</label>
                <Input
                  name="accountNumber"
                  value={supplier.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter Account Number"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Bank & Branch Name:</label>
                <Input
                  name="bankBranchName"
                  value={supplier.bankBranchName}
                  onChange={handleChange}
                  placeholder="Enter Bank & Branch"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">IFSC Code:</label>
                <Input name="ifscCode" value={supplier.ifscCode} onChange={handleChange} placeholder="IFSC" />
              </div>
            </div>

            <div className="border-b border-gray-300 pb-4 mb-6">
              <h2 className="text-xl font-semibold text-center">Attachments</h2>
            </div>

            <div className="mb-8">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

              {/* Existing attachments */}
              {existingAttachments.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Existing Attachments:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {existingAttachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between border rounded-md p-2">
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm truncate"
                        >
                          {attachment.name}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeExistingAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New files to upload */}
              {files.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Files to Upload:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between border rounded-md p-2">
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                onClick={handleFileUpload}
              >
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white px-8 py-2 rounded-md hover:bg-gray-800"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>

        <footer className="mt-auto bg-purple-800 text-white text-center py-3">
          Copyright © 2023 Digielves Tech Wizards Private Limited. All rights reserved
        </footer>
      </div>
    </div>
  )
}

