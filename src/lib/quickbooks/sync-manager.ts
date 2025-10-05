import { QuickBooksClient } from "./client"
import { CustomerService } from "./services/customer.service"
import { ItemService } from "./services/item.service"
import { InvoiceService } from "./services/invoice.service"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class QuickBooksSyncManager {
  private client: QuickBooksClient
  private customerService: CustomerService
  private itemService: ItemService
  private invoiceService: InvoiceService

  constructor(config: {
    realmId: string
    accessToken: string
    refreshToken: string
    expiresIn: number
  }) {
    this.client = new QuickBooksClient(config)
    this.customerService = new CustomerService(this.client)
    this.itemService = new ItemService(this.client)
    this.invoiceService = new InvoiceService(this.client)
  }

  async syncAll() {
    const results = {
      clientes: await this.syncClientes(),
      produtos: await this.syncProdutos(),
      pedidos: await this.syncPedidos(),
    }

    return results
  }

  async syncClientes(clienteId?: number) {
    try {
      const clientes = clienteId
        ? [await prisma.cliente.findUnique({ where: { id: clienteId } })]
        : await prisma.cliente.findMany()

      const results = []

      for (const cliente of clientes) {
        if (!cliente) continue

        try {
          let result
          if (cliente.quickbooksId) {
            // Update existing customer
            result = await this.customerService.updateCustomer(cliente.quickbooksId, cliente)
          } else {
            // Create new customer
            result = await this.customerService.createCustomer(cliente)

            // Update local record with QuickBooks ID
            await prisma.cliente.update({
              where: { id: cliente.id },
              data: {
                quickbooksId: result.Customer.Id,
                syncedAt: new Date(),
                syncStatus: "success",
              },
            })
          }

          // Log success
          await this.logSync({
            entityType: "cliente",
            entityId: cliente.id,
            action: cliente.quickbooksId ? "update" : "create",
            status: "success",
            quickbooksId: result.Customer.Id,
          })

          results.push({ id: cliente.id, status: "success" })
        } catch (error) {
          console.error(`Error syncing cliente ${cliente.id}:`, error)

          // Log error
          await this.logSync({
            entityType: "cliente",
            entityId: cliente.id,
            action: cliente.quickbooksId ? "update" : "create",
            status: "error",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          })

          results.push({ id: cliente.id, status: "error" })
        }
      }

      return results
    } finally {
      await prisma.$disconnect()
    }
  }

  async syncProdutos(produtoId?: number) {
    try {
      const produtos = produtoId
        ? [await prisma.produto.findUnique({ where: { id: produtoId }, include: { categoria: true } })]
        : await prisma.produto.findMany({ include: { categoria: true } })

      const results = []

      for (const produto of produtos) {
        if (!produto) continue

        try {
          let result
          if (produto.quickbooksId) {
            // Update existing item
            result = await this.itemService.updateItem(produto.quickbooksId, produto)
          } else {
            // Create new item
            result = await this.itemService.createItem(produto)

            // Update local record with QuickBooks ID
            await prisma.produto.update({
              where: { id: produto.id },
              data: {
                quickbooksId: result.Item.Id,
                syncedAt: new Date(),
                syncStatus: "success",
              },
            })
          }

          // Log success
          await this.logSync({
            entityType: "produto",
            entityId: produto.id,
            action: produto.quickbooksId ? "update" : "create",
            status: "success",
            quickbooksId: result.Item.Id,
          })

          results.push({ id: produto.id, status: "success" })
        } catch (error) {
          console.error(`Error syncing produto ${produto.id}:`, error)

          // Log error
          await this.logSync({
            entityType: "produto",
            entityId: produto.id,
            action: produto.quickbooksId ? "update" : "create",
            status: "error",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          })

          results.push({ id: produto.id, status: "error" })
        }
      }

      return results
    } finally {
      await prisma.$disconnect()
    }
  }

  async syncPedidos(pedidoId?: number) {
    try {
      const pedidos = pedidoId
        ? [
            await prisma.pedido.findUnique({
              where: { id: Number.parseInt(pedidoId.toString()) },
              include: { cliente: true, itens: { include: { produto: true } } },
            }),
          ]
        : await prisma.pedido.findMany({ include: { cliente: true, itens: { include: { produto: true } } } })

      const results = []

      for (const pedido of pedidos) {
        if (!pedido) continue

        try {
          let result
          if (pedido.quickbooksId) {
            // Update existing invoice
            result = await this.invoiceService.updateInvoice(pedido.quickbooksId, pedido)
          } else {
            // Create new invoice
            result = await this.invoiceService.createInvoice(pedido)

            // Update local record with QuickBooks ID
            await prisma.pedido.update({
              where: { id: pedido.id },
              data: {
                quickbooksId: result.Invoice.Id,
                syncedAt: new Date(),
                syncStatus: "success",
              },
            })
          }

          // Log success
          await this.logSync({
            entityType: "pedido",
            entityId: pedido.id,
            action: pedido.quickbooksId ? "update" : "create",
            status: "success",
            quickbooksId: result.Invoice.Id,
          })

          results.push({ id: pedido.id, status: "success" })
        } catch (error) {
          console.error(`Error syncing pedido ${pedido.id}:`, error)

          // Log error
          await this.logSync({
            entityType: "pedido",
            entityId: pedido.id,
            action: pedido.quickbooksId ? "update" : "create",
            status: "error",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          })

          results.push({ id: pedido.id, status: "error" })
        }
      }

      return results
    } finally {
      await prisma.$disconnect()
    }
  }

  private async logSync(data: {
    entityType: string
    entityId: number
    action: string
    status: string
    quickbooksId?: string
    errorMessage?: string
  }) {
    try {
      await prisma.syncLog.create({ data: data as any })
    } catch (error) {
      console.error("Error creating sync log:", error)
    }
  }
}
