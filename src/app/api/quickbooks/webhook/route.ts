import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { QuickBooksSyncManager } from "@/lib/quickbooks/sync-manager"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("intuit-signature")
    const body = await request.text()

    // Verify webhook signature
    if (!verifyWebhookSignature(signature, body)) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = JSON.parse(body)
    console.log("Webhook received:", payload)

    // Get QuickBooks config
    const config = await prisma.quickBooksConfig.findFirst({
      orderBy: { createdAt: "desc" },
    })

    if (!config) {
      console.error("QuickBooks not configured")
      return NextResponse.json({ error: "Not configured" }, { status: 400 })
    }

    // Process webhook events
    const syncManager = new QuickBooksSyncManager({
      realmId: config.realmId,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      expiresIn: Math.floor((config.expiresAt.getTime() - Date.now()) / 1000),
    })

    for (const entity of payload.eventNotifications) {
      for (const dataChangeEvent of entity.dataChangeEvent.entities) {
        const entityType = dataChangeEvent.name
        const entityId = dataChangeEvent.id
        const operation = dataChangeEvent.operation

        console.log(`Processing ${operation} for ${entityType} ${entityId}`)

        // Handle different entity types
        if (entityType === "Customer") {
          await syncManager.syncClientes()
        } else if (entityType === "Item") {
          await syncManager.syncProdutos()
        } else if (entityType === "Invoice") {
          await syncManager.syncPedidos()
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

function verifyWebhookSignature(signature: string | null, payload: string): boolean {
  if (!signature || !process.env.QUICKBOOKS_WEBHOOK_TOKEN) {
    return false
  }

  const hmac = crypto.createHmac("sha256", process.env.QUICKBOOKS_WEBHOOK_TOKEN)
  hmac.update(payload)
  const hash = hmac.digest("base64")

  return signature === hash
}
