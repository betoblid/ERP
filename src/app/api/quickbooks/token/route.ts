import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const tokens = await request.json()

    if (
      !tokens.access_token ||
      !tokens.refresh_token ||
      !tokens.realmId ||
      !tokens.expires_in ||
      !tokens.x_refresh_token_expires_in
    ) {
      return NextResponse.json({ error: "Missing token fields" }, { status: 400 })
    }

    await prisma.quickBooksConfig.upsert({
      where: { id: 1 },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        realmId: tokens.realmId,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        refreshTokenExpiresAt: new Date(Date.now() + tokens.x_refresh_token_expires_in * 1000),
      },
      create: {
        id: 1,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        realmId: tokens.realmId,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        refreshTokenExpiresAt: new Date(Date.now() + tokens.x_refresh_token_expires_in * 1000),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving tokens:", error)
    return NextResponse.json({ error: "Failed to save tokens" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    const config = await prisma.quickBooksConfig.findUnique({
      where: { id: 1 },
    })

    if (!config) {
      return NextResponse.json({ error: "QuickBooks not configured" }, { status: 404 })
    }

    return NextResponse.json({
      realmId: config.realmId,
      isConfigured: true,
      accessTokenExpiresAt: config.expiresAt,
      refreshTokenExpiresAt: config.refreshTokenExpiresAt,
    })
  } catch (error) {
    console.error("Error fetching tokens:", error)
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
