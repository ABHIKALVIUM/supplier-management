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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const skip = (page - 1) * limit

    // Connect to database
    const db = await connectToDatabase()
    const collection = db.collection("suppliers")

    // Build query
    const query = search ? { companyName: { $regex: search, $options: "i" } } : {}

    // Get suppliers with pagination
    const suppliers = await collection.find(query).skip(skip).limit(limit).toArray()

    // Get total count
    const total = await collection.countDocuments(query)

    return NextResponse.json({
      suppliers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify token
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const supplierData = await request.json()

    // Validate required fields
    if (!supplierData.companyName || !supplierData.vendorName || !supplierData.primaryEmail) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    const db = await connectToDatabase()
    const collection = db.collection("suppliers")

    // Format data for database
    const newSupplier = {
      ...supplierData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert supplier
    const result = await collection.insertOne(newSupplier)

    return NextResponse.json({
      message: "Supplier added successfully",
      supplierId: result.insertedId,
    })
  } catch (error) {
    console.error("Error adding supplier:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

