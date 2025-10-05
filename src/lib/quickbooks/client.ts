import axios, { type AxiosInstance } from "axios"

export class QuickBooksClient {
  private client: AxiosInstance
  private realmId: string
  private accessToken: string
  private refreshToken: string
  private tokenExpiresAt: Date

  constructor(config: {
    realmId: string
    accessToken: string
    refreshToken: string
    expiresIn: number
  }) {
    this.realmId = config.realmId
    this.accessToken = config.accessToken
    this.refreshToken = config.refreshToken
    this.tokenExpiresAt = new Date(Date.now() + config.expiresIn * 1000)

    const baseURL =
      process.env.QUICKBOOKS_ENVIRONMENT === "production"
        ? "https://quickbooks.api.intuit.com"
        : "https://sandbox-quickbooks.api.intuit.com"

    this.client = axios.create({
      baseURL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    this.client.interceptors.request.use(async (config) => {
      await this.ensureValidToken()
      config.headers.Authorization = `Bearer ${this.accessToken}`
      return config
    })
  }

  private async ensureValidToken() {
    if (new Date() >= this.tokenExpiresAt) {
      await this.refreshAccessToken()
    }
  }

  private async refreshAccessToken() {
    try {
      const response = await axios.post(
        "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
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

      this.accessToken = response.data.access_token
      this.refreshToken = response.data.refresh_token
      this.tokenExpiresAt = new Date(Date.now() + response.data.expires_in * 1000)

      // Save updated tokens
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quickbooks/tokens`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realmId: this.realmId,
          access_token: this.accessToken,
          refresh_token: this.refreshToken,
          expires_in: response.data.expires_in,
          x_refresh_token_expires_in: response.data.x_refresh_token_expires_in,
        }),
      })
    } catch (error) {
      console.error("Failed to refresh QuickBooks token:", error)
      throw new Error("Failed to refresh QuickBooks access token")
    }
  }

  async get<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.client.get(`/v3/company/${this.realmId}${endpoint}`, { params })
    return response.data
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.client.post(`/v3/company/${this.realmId}${endpoint}`, data)
    return response.data
  }

  async query<T>(queryString: string): Promise<T[]> {
    const response = await this.client.get(`/v3/company/${this.realmId}/query`, {
      params: { query: queryString },
    })
    return response.data.QueryResponse?.[Object.keys(response.data.QueryResponse)[0]] || []
  }
}
