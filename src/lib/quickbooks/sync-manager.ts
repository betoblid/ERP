import { QuickBooksClient } from "./client"
import { CustomerService } from "./services/customer.service"
import { ItemService } from "./services/item.service"
import { InvoiceService } from "./services/invoice.service"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface QuickBooksConfig {
  realmId: string
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export class QuickBooksSyncManager {
  private client: QuickBooksClient
  private customerService: CustomerService
  private itemService: ItemService
  private invoiceService: InvoiceService

  constructor(config: QuickBooksConfig) {
    this.client = new QuickBooksClient(config)
    this.customerService = new CustomerService(this.client)
    this.itemService = new ItemService(this.client)
    this.invoiceService = new InvoiceService(this.client)
  }

  async syncClientes(clienteId?: number) {
    console.log("Iniciando sincronização de clientes...")

    try {
      const clientes = clienteId
        ? [await prisma.cliente.findUnique({ where: { id: clienteId } })]
        : await prisma.cliente.findMany()

      const results = []

      for (const cliente of clientes) {
        if (!cliente) continue

        try {
          if (cliente.quickbooksId) {
            await this.customerService.updateCustomer(cliente)
            results.push({ id: cliente.id, status: "updated" })
          } else {
            await this.customerService.createCustomer(cliente)
            results.push({ id: cliente.id, status: "created" })
          }
        } catch (error) {
          console.error(`Erro ao sincronizar cliente ${cliente.id}:`, error)
          await prisma.syncLog.create({
            data: {
              entityType: "cliente",
              entityId: cliente.id,
              action: cliente.quickbooksId ? "update" : "create",
              status: "error",
              errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
            },
          })
          results.push({ id: cliente.id, status: "error", error: error instanceof Error ? error.message : "Erro" })
        }
      }

      console.log(`Sincronização de clientes concluída: ${results.length} registros processados`)
      return results
    } finally {
      await prisma.$disconnect()
    }
  }

  async syncProdutos(produtoId?: number) {
    console.log("Iniciando sincronização de produtos...")

    try {
      const produtos = produtoId
        ? [await prisma.produto.findUnique({ where: { id: produtoId }, include: { categoria: true } })]
        : await prisma.produto.findMany({ include: { categoria: true } })

      const results = []

      for (const produto of produtos) {
        if (!produto) continue

        try {
          if (produto.quickbooksId) {
            await this.itemService.updateItem(produto)
            results.push({ id: produto.id, status: "updated" })
          } else {
            await this.itemService.createItem(produto)
            results.push({ id: produto.id, status: "created" })
          }
        } catch (error) {
          console.error(`Erro ao sincronizar produto ${produto.id}:`, error)
          await prisma.syncLog.create({
            data: {
              entityType: "produto",
              entityId: produto.id,
              action: produto.quickbooksId ? "update" : "create",
              status: "error",
              errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
            },
          })
          results.push({ id: produto.id, status: "error", error: error instanceof Error ? error.message : "Erro" })
        }
      }

      console.log(`Sincronização de produtos concluída: ${results.length} registros processados`)
      return results
    } finally {
      await prisma.$disconnect()
    }
  }

  async syncPedidos(pedidoId?: number) {
    console.log("Iniciando sincronização de pedidos...")

    try {
      const pedidos = pedidoId
        ? [
            await prisma.pedido.findUnique({
              where: { id: pedidoId },
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
            }),
          ]
        : await prisma.pedido.findMany({
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

      const results = []

      for (const pedido of pedidos) {
        if (!pedido) continue

        try {
          if (!pedido.cliente.quickbooksId) {
            await this.customerService.createCustomer(pedido.cliente)
          }

          for (const item of pedido.itens) {
            if (!item.produto.quickbooksId) {
              await this.itemService.createItem(item.produto)
            }
          }

          if (pedido.quickbooksId) {
            await this.invoiceService.updateInvoice(pedido as any)
            results.push({ id: pedido.id, status: "updated" })
          } else {
            await this.invoiceService.createInvoice(pedido as any)
            results.push({ id: pedido.id, status: "created" })
          }
        } catch (error) {
          console.error(`Erro ao sincronizar pedido ${pedido.id}:`, error)
          await prisma.syncLog.create({
            data: {
              entityType: "pedido",
              entityId: pedido.id,
              action: pedido.quickbooksId ? "update" : "create",
              status: "error",
              errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
            },
          })
          results.push({ id: pedido.id, status: "error", error: error instanceof Error ? error.message : "Erro" })
        }
      }

      console.log(`Sincronização de pedidos concluída: ${results.length} registros processados`)
      return results
    } finally {
      await prisma.$disconnect()
    }
  }

  async syncAll() {
    console.log("Iniciando sincronização completa...")

    const clientesResult = await this.syncClientes()
    const produtosResult = await this.syncProdutos()
    const pedidosResult = await this.syncPedidos()

    return {
      clientes: clientesResult,
      produtos: produtosResult,
      pedidos: pedidosResult,
    }
  }

  async syncEntity(entityType: string, entityId: number) {
    switch (entityType) {
      case "cliente":
        return await this.syncClientes(entityId)
      case "produto":
        return await this.syncProdutos(entityId)
      case "pedido":
        return await this.syncPedidos(entityId)
      default:
        throw new Error(`Tipo de entidade inválido: ${entityType}`)
    }
  }

  async syncAllOfType(entityType: string) {
    switch (entityType) {
      case "cliente":
        return await this.syncClientes()
      case "produto":
        return await this.syncProdutos()
      case "pedido":
        return await this.syncPedidos()
      default:
        throw new Error(`Tipo de entidade inválido: ${entityType}`)
    }
  }
}
