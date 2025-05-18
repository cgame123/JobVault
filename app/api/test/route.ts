import { NextResponse } from "next/server"

export async function GET() {
  console.log("Test endpoint was called")
  return NextResponse.json({ message: "API is working!" })
}
