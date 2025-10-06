import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const realmId = searchParams.get("realmId")
    const error = searchParams.get("error")

    console.log("OAuth callback received:", { code: !!code, realmId, error })

    if (error) {
      console.error("OAuth error:", error)
      return NextResponse.redirect(new URL(`/configuracoes/quickbooks?error=${encodeURIComponent(error)}`, request.url))
    }

    if (!code || !realmId) {
      return NextResponse.redirect(new URL("/configuracoes/quickbooks?error=missing_parameters", request.url))
    }

    // Exchange code for tokens
    const tokenUrl =
      process.env.QUICKBOOKS_ENVIRONMENT === "production"
        ? "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
        : "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"

    const clientId = process.env.QUICKBOOKS_CLIENT_ID!
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
    const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI!

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    console.log("Exchanging code for tokens...")

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Token exchange failed:", errorText)
      throw new Error(`Token exchange failed: ${errorText}`)
    }

    const tokens = await tokenResponse.json()
    console.log("Tokens received successfully")

    // Calculate expiration dates
    const now = new Date()
    const expiresAt = new Date(now.getTime() + tokens.expires_in * 1000)
    const refreshTokenExpiresAt = new Date(now.getTime() + tokens.x_refresh_token_expires_in * 1000)

    // Save or update QuickBooks config
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
          updatedAt: new Date(),
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
        },
      })
    }

    console.log("QuickBooks config saved successfully")

    // Redirect to success page
    return NextResponse.redirect(new URL("/configuracoes/quickbooks?success=true", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(
      new URL(
        `/configuracoes/quickbooks?error=${encodeURIComponent(error instanceof Error ? error.message : "unknown_error")}`,
        request.url,
      ),
    )
  } finally {
    await prisma.$disconnect()
  }
}
