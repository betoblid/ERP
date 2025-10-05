import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { QuickBooksClient } from "@/lib/quickbooks/client"
import { SyncManager } from "@/lib/quickbooks/sync-manager"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { entityType, entityId } = await request.json()

    // Get QuickBooks config
    const config = await prisma.quickBooksConfig.findFirst({
      orderBy: { createdAt: "desc" },
    })

    if (!config) {
      return NextResponse.json({ error: "QuickBooks not configured" }, { status: 400 })
    }

    // Create QuickBooks client
    const client = new QuickBooksClient({
      realmId: config.realmId,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      expiresIn: Math.floor((config.expiresAt.getTime() - Date.now()) / 1000),
    })

    const syncManager = new SyncManager(client)

    if (entityType === "all") {
      await syncManager.syncAll()
    } else if (entityType === "cliente") {
      if (entityId) {
        const cliente = await prisma.cliente.findUnique({ where: { id: entityId } })
        if (cliente) {
          await syncManager.syncCliente(cliente as any)
        }
      } else {
        const clientes = await prisma.cliente.findMany()
        for (const cliente of clientes) {
          await syncManager.syncCliente(cliente as any)
        }
      }
    } else if (entityType === "produto") {
      if (entityId) {
        const produto = await prisma.produto.findUnique({
          where: { id: entityId },
          include: { categoria: true },
        })
        if (produto) {
          await syncManager.syncProduto(produto as any)
        }
      } else {
        const produtos = await prisma.produto.findMany({ include: { categoria: true } })
        for (const produto of produtos) {
          await syncManager.syncProduto(produto as any)
        }
      }
    } else if (entityType === "pedido") {
      if (entityId) {
        const pedido = await prisma.pedido.findUnique({
          where: { id: entityId },
          include: {
            cliente: true,
            itens: {
              include: {
                produto: {
                  include: {
                    categoria: true,
                  },
                },
              },
            },
          },
        })
        if (pedido) {
          await syncManager.syncPedido(pedido as any)
        }
      } else {
        const pedidos = await prisma.pedido.findMany({
          include: {
            cliente: true,
            itens: {
              include: {
                produto: {
                  include: {
                    categoria: true,
                  },
                },
              },
            },
          },
        })
        for (const pedido of pedidos) {
          await syncManager.syncPedido(pedido as any)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json(
      { error: "Sync failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
