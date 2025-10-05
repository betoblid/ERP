import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const realmId = searchParams.get("realmId")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      console.error("QuickBooks OAuth error:", error)
      return NextResponse.redirect(new URL(`/configuracoes/quickbooks?error=auth_failed`, request.url))
    }

    // Validate required parameters
    if (!code || !realmId) {
      console.error("Missing code or realmId")
      return NextResponse.redirect(new URL(`/configuracoes/quickbooks?error=missing_params`, request.url))
    }

    console.log("Exchanging code for tokens...")

    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.QUICKBOOKS_REDIRECT_URI || `${process.env.NEXT_PUBLIC_API_URL}/api/quickbooks/auth`,
      }),
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`,
          ).toString("base64")}`,
        },
      },
    )

    console.log("Tokens received successfully")

    // Save tokens to database
    const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quickbooks/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        realmId: realmId,
        access_token: tokenResponse.data.access_token,
        refresh_token: tokenResponse.data.refresh_token,
        expires_in: tokenResponse.data.expires_in,
        x_refresh_token_expires_in: tokenResponse.data.x_refresh_token_expires_in,
      }),
    })

    if (!saveResponse.ok) {
      throw new Error("Failed to save tokens")
    }

    console.log("Tokens saved to database")

    // Redirect to success page
    return NextResponse.redirect(new URL("/configuracoes/quickbooks?success=true", request.url))
  } catch (error) {
    console.error("QuickBooks OAuth error:", error)
    return NextResponse.redirect(new URL(`/configuracoes/quickbooks?error=true`, request.url))
  }
}
