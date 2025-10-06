import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface QuickBooksConfig {
  realmId: string
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export class QuickBooksClient {
  private config: QuickBooksConfig
  private baseUrl: string

  constructor(config: QuickBooksConfig) {
    this.config = config
    this.baseUrl =
      process.env.QUICKBOOKS_ENVIRONMENT === "production"
        ? "https://quickbooks.api.intuit.com/v3/company"
        : "https://sandbox-quickbooks.api.intuit.com/v3/company"
  }

  private async ensureValidToken(): Promise<string> {
    // Check if token is expired
    if (this.config.expiresIn <= 60) {
      console.log("Token expired, refreshing...")
      await this.refreshToken()
    }

    return this.config.accessToken
  }

  private async refreshToken(): Promise<void> {
    const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
    const clientId = process.env.QUICKBOOKS_CLIENT_ID!
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.config.refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }

    const tokens = await response.json()

    // Update config in database
    const config = await prisma.quickBooksConfig.findFirst({
      where: { realmId: this.config.realmId },
    })

    if (config) {
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
        },
      })

      this.config.accessToken = tokens.access_token
      this.config.refreshToken = tokens.refresh_token
      this.config.expiresIn = tokens.expires_in
    }
  }

  async get<T = any>(endpoint: string): Promise<T> {
    const token = await this.ensureValidToken()
    const url = `${this.baseUrl}/${this.config.realmId}${endpoint}`

    console.log(`GET ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`QuickBooks API error:`, error)
      throw new Error(`QuickBooks API error: ${error}`)
    }

    return response.json()
  }

  async post<T = any>(endpoint: string, data: any): Promise<T> {
    const token = await this.ensureValidToken()
    const url = `${this.baseUrl}/${this.config.realmId}${endpoint}`

    console.log(`POST ${url}`, JSON.stringify(data, null, 2))

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`QuickBooks API error:`, error)
      throw new Error(`QuickBooks API error: ${error}`)
    }

    return response.json()
  }

  async put<T = any>(endpoint: string, data: any): Promise<T> {
    return this.post(endpoint, data)
  }

  async query<T = any>(queryString: string): Promise<T[]> {
    const token = await this.ensureValidToken()
    const url = `${this.baseUrl}/${this.config.realmId}/query?query=${encodeURIComponent(queryString)}`

    console.log(`QUERY ${queryString}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`QuickBooks API error:`, error)
      throw new Error(`QuickBooks API error: ${error}`)
    }

    const result = await response.json()
    return result.QueryResponse?.Customer || result.QueryResponse?.Item || result.QueryResponse?.Invoice || []
  }
}
