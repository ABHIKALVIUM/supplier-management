import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

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

export async function POST(request: NextRequest) {
  try {
    // Verify token
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a unique filename
    const uniqueId = uuidv4()
    const fileName = `${uniqueId}-${file.name}`
    const uploadDir = join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, fileName)

    // Ensure the upload directory exists
    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error("Error writing file:", error)
      return NextResponse.json({ message: "Error saving file" }, { status: 500 })
    }

    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({
      message: "File uploaded successfully",
      url: fileUrl,
      name: file.name,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

