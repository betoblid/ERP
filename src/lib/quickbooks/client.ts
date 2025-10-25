import axios, { type AxiosInstance } from "axios"
import { prisma } from "@/lib/prisma"

interface QuickBooksTokens {
  accessToken: string
  refreshToken: string
  realmId: string
  expiresAt: Date
}

export class QuickBooksClient {
  private axiosInstance: AxiosInstance
  private tokens: QuickBooksTokens | null = null

  constructor() {
    const baseURL =
      process.env.QUICKBOOKS_ENVIRONMENT === "production"
        ? "https://quickbooks.api.intuit.com"
        : "https://sandbox-quickbooks.api.intuit.com"

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    this.axiosInstance.interceptors.request.use(async (config) => {
      await this.ensureValidToken()
      if (this.tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${this.tokens.accessToken}`
      }
      return config
    })

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.refreshAccessToken()
          return this.axiosInstance.request(error.config)
        }
        return Promise.reject(error)
      },
    )
  }

  private async ensureValidToken() {
    if (!this.tokens) {
      await this.loadTokens()
    }

    if (this.tokens && new Date() >= this.tokens.expiresAt) {
      await this.refreshAccessToken()
    }
  }

  private async loadTokens() {
    const config = await prisma.quickBooksConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })

    if (!config) {
      throw new Error("QuickBooks não configurado. Configure em /configuracoes/quickbooks")
    }

    this.tokens = {
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      realmId: config.realmId,
      expiresAt: config.expiresAt,
    }
  }

  private async refreshAccessToken() {
    if (!this.tokens?.refreshToken) {
      throw new Error("Token de refresh não disponível")
    }

    const credentials = Buffer.from(
      `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`,
    ).toString("base64")

    const response = await axios.post(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.tokens.refreshToken,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
      },
    )

    const { access_token, refresh_token, expires_in } = response.data

    this.tokens = {
      accessToken: access_token,
      refreshToken: refresh_token,
      realmId: this.tokens.realmId,
      expiresAt: new Date(Date.now() + expires_in * 1000),
    }

    await prisma.quickBooksConfig.updateMany({
      where: { realmId: this.tokens.realmId },
      data: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: this.tokens.expiresAt,
      },
    })
  }

  async get(endpoint: string) {
    await this.ensureValidToken()
    const response = await this.axiosInstance.get(`/v3/company/${this.tokens?.realmId}${endpoint}`)
    return response.data
  }

  async post(endpoint: string, data: any) {
    await this.ensureValidToken()
    const response = await this.axiosInstance.post(`/v3/company/${this.tokens?.realmId}${endpoint}`, data)
    return response.data
  }

  async query(query: string) {
    return this.get(`/query?query=${encodeURIComponent(query)}&minorversion=75`)
  }

  getRealmId() {
    return this.tokens?.realmId
  }
}

export const qbClient = new QuickBooksClient()
