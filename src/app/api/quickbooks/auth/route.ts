import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const realmId = searchParams.get("realmId")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    console.error("Erro no OAuth:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/configuracoes/quickbooks?error=${error}`)
  }

  if (!code || !realmId) {
    console.error("Código ou realmId ausente")
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/configuracoes/quickbooks?error=missing_params`)
  }

  try {
    console.log("Trocando código por tokens...")

    const clientId = process.env.QUICKBOOKS_CLIENT_ID!
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
    const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI!

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const tokenResponse = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Erro ao trocar código por tokens:", errorText)
      throw new Error("Falha ao obter tokens")
    }

    const tokens = await tokenResponse.json()

    const now = new Date()
    const expiresAt = new Date(now.getTime() + tokens.expires_in * 1000)
    const refreshTokenExpiresAt = new Date(now.getTime() + tokens.x_refresh_token_expires_in * 1000)

    const existingConfig = await prisma.quickBooksConfig.findFirst({
      where: { realmId },
    })

    if (existingConfig) {
      await prisma.quickBooksConfig.update({
        where: { id: existingConfig.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt,
          refreshTokenExpiresAt,
          isActive: true,
        },
      })
    } else {
      await prisma.quickBooksConfig.create({
        data: {
          realmId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt,
          refreshTokenExpiresAt,
          isActive: true,
        },
      })
    }

    console.log("Tokens salvos com sucesso!")

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/configuracoes/quickbooks?success=true`)
  } catch (error) {
    console.error("Erro ao processar OAuth:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/configuracoes/quickbooks?error=auth_failed`)
  } finally {
    await prisma.$disconnect()
  }
}
