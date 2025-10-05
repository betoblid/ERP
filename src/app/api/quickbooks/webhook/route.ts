import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const config = await prisma.quickBooksConfig.findFirst({
      orderBy: { createdAt: "desc" },
    })

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

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

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error saving QuickBooks tokens:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()

    const config = await prisma.quickBooksConfig.findFirst({
      where: { realmId: data.realmId },
    })

    if (!config) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 })
    }

    const updated = await prisma.quickBooksConfig.update({
      where: { id: config.id },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        refreshTokenExpiresAt: new Date(Date.now() + data.x_refresh_token_expires_in * 1000),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating QuickBooks tokens:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
