import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const logs = await prisma.syncLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Erro ao buscar logs:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
