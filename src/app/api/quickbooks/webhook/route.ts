import { NextResponse } from "next/server"
import { QuickBooksSyncManager } from "@/lib/quickbooks/sync-manager"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("intuit-signature")
    const body = await request.text()

    const webhookToken = process.env.QUICKBOOKS_WEBHOOK_TOKEN

    if (webhookToken && signature) {
      const hash = crypto.createHmac("sha256", webhookToken).update(body).digest("base64")

      if (hash !== signature) {
        console.error("Assinatura do webhook inválida")
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
      }
    }

    const payload = JSON.parse(body)

    console.log("Webhook recebido:", payload)

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

    for (const event of payload.eventNotifications) {
      for (const entity of event.dataChangeEvent.entities) {
        console.log(`Processando evento: ${entity.name} (${entity.operation})`)

        if (entity.name === "Customer") {
        } else if (entity.name === "Item") {
        } else if (entity.name === "Invoice") {
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
