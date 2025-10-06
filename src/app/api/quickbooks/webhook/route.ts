import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const payload = await request.text()
    const signature = request.headers.get("intuit-signature")

    // Verify webhook signature
    const webhookToken = process.env.QUICKBOOKS_WEBHOOK_TOKEN
    if (webhookToken && signature) {
      const hash = crypto.createHmac("sha256", webhookToken).update(payload).digest("base64")

      if (hash !== signature) {
        console.error("Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const data = JSON.parse(payload)
    console.log("Webhook received:", data)

    // Process webhook events
    for (const event of data.eventNotifications || []) {
      const realmId = event.realmId
      const dataChangeEvent = event.dataChangeEvent

      if (!dataChangeEvent) continue

      for (const entity of dataChangeEvent.entities || []) {
        const entityName = entity.name
        const entityId = entity.id
        const operation = entity.operation

        console.log(`Webhook event: ${operation} on ${entityName} with ID ${entityId}`)

        // Log webhook event
        await prisma.syncLog.create({
          data: {
            entityType: entityName.toLowerCase(),
            entityId: 0,
            action: operation.toLowerCase(),
            status: "success",
            quickbooksId: entityId,
            errorMessage: "Webhook event received",
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
