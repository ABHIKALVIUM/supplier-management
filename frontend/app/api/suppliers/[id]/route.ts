import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify token
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supplierId = params.id

    // Connect to database
    const db = await connectToDatabase()
    const collection = db.collection("suppliers")

    // Get supplier by ID
    const supplier = await collection.findOne({ _id: new ObjectId(supplierId) })

    if (!supplier) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 })
    }

    return NextResponse.json({ supplier })
  } catch (error) {
    console.error("Error fetching supplier:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify token
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supplierId = params.id
    const supplierData = await request.json()

    // Connect to database
    const db = await connectToDatabase()
    const collection = db.collection("suppliers")

    // Check if supplier exists
    const existingSupplier = await collection.findOne({ _id: new ObjectId(supplierId) })
    if (!existingSupplier) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 })
    }

    // Update supplier
    const result = await collection.updateOne(
      { _id: new ObjectId(supplierId) },
      {
        $set: {
          ...supplierData,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      message: "Supplier updated successfully",
      supplierId,
    })
  } catch (error) {
    console.error("Error updating supplier:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify token
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supplierId = params.id

    // Connect to database
    const db = await connectToDatabase()
    const collection = db.collection("suppliers")

    // Check if supplier exists
    const existingSupplier = await collection.findOne({ _id: new ObjectId(supplierId) })
    if (!existingSupplier) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 })
    }

    // Delete supplier
    const result = await collection.deleteOne({ _id: new ObjectId(supplierId) })

    return NextResponse.json({
      message: "Supplier deleted successfully",
      supplierId,
    })
  } catch (error) {
    console.error("Error deleting supplier:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

