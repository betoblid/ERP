import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const config = await prisma.quickBooksConfig.findFirst({
      orderBy: { createdAt: "desc" },
    })

    if (!config) {
      return NextResponse.json({ isConfigured: false })
    }

    // Check if token is expired
    const now = new Date()
    const isExpired = config.expiresAt < now

    return NextResponse.json({
      isConfigured: true,
      realmId: config.realmId,
      isExpired,
      expiresAt: config.expiresAt,
    })
  } catch (error) {
    console.error("Error fetching tokens:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json()

    if (action === "refresh") {
      const config = await prisma.quickBooksConfig.findFirst({
        orderBy: { createdAt: "desc" },
      })

      if (!config) {
        return NextResponse.json({ error: "QuickBooks not configured" }, { status: 400 })
      }

      // Refresh token
      const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
      const clientId = process.env.QUICKBOOKS_CLIENT_ID!
      const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: config.refreshToken,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error("Failed to refresh token")
      }

      const tokens = await tokenResponse.json()

      // Update config
      const now = new Date()
      const expiresAt = new Date(now.getTime() + tokens.expires_in * 1000)
      const refreshTokenExpiresAt = new Date(now.getTime() + tokens.x_refresh_token_expires_in * 1000)

      await prisma.quickBooksConfig.update({
        where: { id: config.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt,
          refreshTokenExpiresAt,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
