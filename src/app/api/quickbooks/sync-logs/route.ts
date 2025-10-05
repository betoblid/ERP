import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const entityType = searchParams.get("entityType")

    console.log(`Fetching sync logs (limit: ${limit}, entityType: ${entityType || "all"})`)

    const where = entityType ? { entityType: entityType as any } : {}

    const logs = await prisma.syncLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    console.log(`Found ${logs.length} sync logs`)

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching sync logs:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    console.log("Creating sync log:", data)

    const log = await prisma.syncLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        status: data.status,
        quickbooksId: data.quickbooksId,
        errorMessage: data.errorMessage,
      },
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error("Error creating sync log:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
