import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { QuickBooksSyncManager } from "@/lib/quickbooks/sync-manager"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { entityType, entityId } = await request.json()

    console.log(`Requisição de sincronização: ${entityType}${entityId ? ` (ID: ${entityId})` : ""}`)

    const config = await prisma.quickBooksConfig.findFirst({
      orderBy: { createdAt: "desc" },
    })

    if (!config) {
      return NextResponse.json({ error: "QuickBooks não configurado" }, { status: 400 })
    }

    const syncManager = new QuickBooksSyncManager({
      realmId: config.realmId,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      expiresIn: Math.floor((config.expiresAt.getTime() - Date.now()) / 1000),
    })

    let result

    if (entityType === "all") {
      result = await syncManager.syncAll()
    } else if (entityId) {
      result = await syncManager.syncEntity(entityType, entityId)
    } else {
      result = await syncManager.syncAllOfType(entityType)
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Erro na sincronização:", error)
    return NextResponse.json(
      {
        error: "Falha na sincronização",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
