"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, ArrowLeft } from "lucide-react"

export default function AddSupplierPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    vendorName: "",
    primaryPhone: "",
    secondaryPhone: "",
    primaryEmail: "",
    secondaryEmail: "",
    pan: "",
    supplierType: "",
    category: "",
    website: "",
    gstNumber: "",
    addressLine1: "",
    addressLine2: "",
    district: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    accountName: "",
    accountNumber: "",
    bankBranchName: "",
    ifscCode: "",
    status: "Active",
    files: [] as File[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // First, upload any files
      const uploadedFiles = []
      if (formData.files && formData.files.length > 0) {
        for (const file of formData.files) {
          const fileFormData = new FormData()
          fileFormData.append("file", file)

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: fileFormData,
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

      // Then submit the supplier data with attachments
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          attachments: uploadedFiles,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Supplier added successfully",
        })
        router.push("/suppliers")
      } else {
        throw new Error(data.message || "Failed to add supplier")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add supplier",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 via-amber-500 to-amber-600 p-4 text-white text-center text-xl font-semibold relative">
          <Button
            type="button"
            onClick={() => router.push("/suppliers")}
            variant="ghost"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-1 h-5 w-5" />
            Back
          </Button>
          Add Supplier
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
                  value={formData.companyName}
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
                  value={formData.vendorName}
                  onChange={handleChange}
                  placeholder="Vendor Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Primary Phone:</label>
                <Input
                  name="primaryPhone"
                  value={formData.primaryPhone}
                  onChange={(e) => {
                    // Only allow numbers
                    const numericValue = e.target.value.replace(/\D/g, "")
                    setFormData((prev) => ({
                      ...prev,
                      primaryPhone: numericValue,
                    }))
                  }}
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
                  value={formData.secondaryPhone}
                  onChange={(e) => {
                    // Only allow numbers
                    const numericValue = e.target.value.replace(/\D/g, "")
                    setFormData((prev) => ({
                      ...prev,
                      secondaryPhone: numericValue,
                    }))
                  }}
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
                  value={formData.primaryEmail}
                  onChange={handleChange}
                  placeholder="Primary Email"
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Secondary Email: <span className="text-red-500">*</span>
                </label>
                <Input
                  name="secondaryEmail"
                  value={formData.secondaryEmail}
                  onChange={handleChange}
                  placeholder="Secondary Email"
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">PAN:</label>
                <Input name="pan" value={formData.pan} onChange={handleChange} placeholder="PAN" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Select Supplier Type:</label>
                <select
                  name="supplierType"
                  value={formData.supplierType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Supplier Type</option>
                  <option value="Manufacturer">Software</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Select Category:</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Technical</option>
                  <option value="Furniture">House Keeping</option>
                  <option value="Office Supplies">Carpenter</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Website:</label>
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Enter Website URL"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">GST Number:</label>
                <Input
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter GST Number"
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
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Address"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Address Line 2:</label>
                <Input
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Address"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">District:</label>
                <Input name="district" value={formData.district} onChange={handleChange} placeholder="District" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">City:</label>
                <Input name="city" value={formData.city} onChange={handleChange} placeholder="Enter City" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">State:</label>
                <Input name="state" value={formData.state} onChange={handleChange} placeholder="Enter State" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Pin code:</label>
                <Input
                  name="pincode"
                  value={formData.pincode}
                  onChange={(e) => {
                    // Only allow numbers
                    const numericValue = e.target.value.replace(/\D/g, "")
                    setFormData((prev) => ({
                      ...prev,
                      pincode: numericValue,
                    }))
                  }}
                  placeholder="Enter Pincode"
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Enter Country:</label>
                <Input name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
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
                  value={formData.accountName}
                  onChange={handleChange}
                  placeholder="Enter Account Name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Account Number:</label>
                <Input
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter Account Number"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Bank & Branch Name:</label>
                <Input
                  name="bankBranchName"
                  value={formData.bankBranchName}
                  onChange={handleChange}
                  placeholder="Enter Bank & Branch"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">IFSC Code:</label>
                <Input name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="IFSC" />
              </div>
            </div>

            <div className="border-b border-gray-300 pb-4 mb-6">
              <h2 className="text-xl font-semibold text-center">Attachments</h2>
            </div>

            <div className="mb-8">
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setFormData((prev) => ({
                      ...prev,
                      files: [...(prev.files || []), ...Array.from(e.target.files || [])],
                    }))
                  }
                }}
              />

              {formData.files && formData.files.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Files to Upload:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between border rounded-md p-2">
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              files: prev.files?.filter((_, i) => i !== index) || [],
                            }))
                          }}
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
                onClick={() => document.getElementById("fileUpload")?.click()}
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

