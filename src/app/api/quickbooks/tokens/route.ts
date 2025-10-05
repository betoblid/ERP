import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("Fetching QuickBooks config...")

    const config = await prisma.quickBooksConfig.findFirst({
      orderBy: { createdAt: "desc" },
    })

    console.log("Config found:", config ? "Yes" : "No")

    if (!config) {
      return NextResponse.json({ isConfigured: false }, { status: 200 })
    }

    return NextResponse.json({
      isConfigured: true,
      realmId: config.realmId,
      expiresAt: config.expiresAt,
      refreshTokenExpiresAt: config.refreshTokenExpiresAt,
    })
  } catch (error) {
    console.error("Error fetching QuickBooks config:", error)
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
    console.log("Saving QuickBooks tokens for realmId:", data.realmId)

    // Delete existing configs
    await prisma.quickBooksConfig.deleteMany()

    // Create new config
    const config = await prisma.quickBooksConfig.create({
      data: {
        realmId: data.realmId,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        refreshTokenExpiresAt: new Date(Date.now() + data.x_refresh_token_expires_in * 1000),
      },
    })

    console.log("Tokens saved successfully")

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error saving QuickBooks tokens:", error)
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
