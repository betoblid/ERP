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

    return NextResponse.json({
      isActive: config.isActive,
      realmId: config.realmId,
      expiresAt: config.expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Erro ao buscar configuração:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: Request) {
  try {
    const { realmId, access_token, refresh_token, expires_in, x_refresh_token_expires_in } = await request.json()

    const now = new Date()
    const expiresAt = new Date(now.getTime() + expires_in * 1000)
    const refreshTokenExpiresAt = new Date(now.getTime() + x_refresh_token_expires_in * 1000)

    const config = await prisma.quickBooksConfig.findFirst({
      where: { realmId },
    })

    if (config) {
      await prisma.quickBooksConfig.update({
        where: { id: config.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt,
          refreshTokenExpiresAt,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar tokens:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
