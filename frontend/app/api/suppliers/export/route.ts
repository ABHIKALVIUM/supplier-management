import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"

const MONGO_URI =
  "mongodb+srv://abhishekchaudhari:Abhishek21@cluster0.xgoxv.mongodb.net/suppliers?retryWrites=true&w=majority&appName=Cluster0"
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Connect to MongoDB
async function connectToDatabase() {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  return client.db("suppliers")
}

// Middleware to verify JWT token
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify token
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const db = await connectToDatabase()
    const collection = db.collection("suppliers")

    // Get all suppliers
    const suppliers = await collection.find({}).toArray()

    // Convert to CSV
    const headers = ["Vendor Name", "Company Name", "Mobile Number", "Email", "GSTIN Number", "PAN Number", "Status"]

    let csv = headers.join(",") + "\n"

    suppliers.forEach((supplier) => {
      const row = [
        supplier.vendorName || "",
        supplier.companyName || "",
        supplier.primaryPhone || "",
        supplier.primaryEmail || "",
        supplier.gstNumber || "",
        supplier.pan || "",
        supplier.status || "Active",
      ]
        .map((field) => `"${field.toString().replace(/"/g, '""')}"`)
        .join(",")
      csv += row + "\n"
    })

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=suppliers.csv",
      },
    })
  } catch (error) {
    console.error("Error exporting suppliers:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

