import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { QuickBooksSyncManager } from "@/lib/quickbooks/sync-manager"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { entityType, entityId } = await request.json()

    console.log(`Starting sync for ${entityType}...`)

    // Get QuickBooks config
    const config = await prisma.quickBooksConfig.findFirst({
      orderBy: { createdAt: "desc" },
    })

    if (!config) {
      return NextResponse.json({ error: "QuickBooks not configured" }, { status: 400 })
    }

    // Initialize sync manager
    const syncManager = new QuickBooksSyncManager({
      realmId: config.realmId,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      expiresIn: Math.floor((config.expiresAt.getTime() - Date.now()) / 1000),
    })

    // Perform sync based on entity type
    let result
    if (entityType === "all") {
      result = await syncManager.syncAll()
    } else if (entityType === "cliente") {
      result = await syncManager.syncClientes(entityId)
    } else if (entityType === "produto") {
      result = await syncManager.syncProdutos(entityId)
    } else if (entityType === "pedido") {
      result = await syncManager.syncPedidos(entityId)
    } else {
      return NextResponse.json({ error: "Invalid entity type" }, { status: 400 })
    }

    console.log("Sync completed:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json(
      {
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
