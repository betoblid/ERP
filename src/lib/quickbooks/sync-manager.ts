import type { QuickBooksClient } from "./client"
import { CustomerService } from "./services/customer.service"
import { ItemService } from "./services/item.service"
import { InvoiceService } from "./services/invoice.service"
import type { Cliente, Produto, Pedido, SyncLog } from "@/types"
import api from "@/lib/api"

export class SyncManager {
  private customerService: CustomerService
  private itemService: ItemService
  private invoiceService: InvoiceService

  constructor(private client: QuickBooksClient) {
    this.customerService = new CustomerService(client)
    this.itemService = new ItemService(client)
    this.invoiceService = new InvoiceService(client)
  }

  async syncCliente(cliente: Cliente): Promise<void> {
    try {
      let quickbooksCustomer

      if (cliente.quickbooksId) {
        // Update existing customer
        const existing = await this.customerService.getCustomer(cliente.quickbooksId)
        quickbooksCustomer = await this.customerService.updateCustomer(
          cliente.quickbooksId,
          cliente,
          existing.SyncToken,
        )
      } else {
        // Create new customer
        quickbooksCustomer = await this.customerService.createCustomer(cliente)
      }

      // Update local database
      await api.put(`/clientes/${cliente.id}`, {
        quickbooksId: quickbooksCustomer.Id,
        syncedAt: new Date(),
        syncStatus: "synced",
      })

      // Log success
      await this.createSyncLog({
        entityType: "cliente",
        entityId: cliente.id,
        action: cliente.quickbooksId ? "update" : "create",
        status: "success",
        quickbooksId: quickbooksCustomer.Id,
      })
    } catch (error) {
      console.error("Error syncing cliente:", error)

      // Update local database with error status
      await api.put(`/clientes/${cliente.id}`, {
        syncStatus: "error",
      })

      // Log error
      await this.createSyncLog({
        entityType: "cliente",
        entityId: cliente.id,
        action: cliente.quickbooksId ? "update" : "create",
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })

      throw error
    }
  }

  async syncProduto(produto: Produto): Promise<void> {
    try {
      let quickbooksItem

      if (produto.quickbooksId) {
        // Update existing item
        const existing = await this.itemService.getItem(produto.quickbooksId)
        quickbooksItem = await this.itemService.updateItem(produto.quickbooksId, produto, existing.SyncToken)
      } else {
        // Create new item
        quickbooksItem = await this.itemService.createItem(produto)
      }

      // Update local database
      await api.put(`/produtos/${produto.id}`, {
        quickbooksId: quickbooksItem.Id,
        syncedAt: new Date(),
        syncStatus: "synced",
      })

      // Log success
      await this.createSyncLog({
        entityType: "produto",
        entityId: produto.id,
        action: produto.quickbooksId ? "update" : "create",
        status: "success",
        quickbooksId: quickbooksItem.Id,
      })
    } catch (error) {
      console.error("Error syncing produto:", error)

      // Update local database with error status
      await api.put(`/produtos/${produto.id}`, {
        syncStatus: "error",
      })

      // Log error
      await this.createSyncLog({
        entityType: "produto",
        entityId: produto.id,
        action: produto.quickbooksId ? "update" : "create",
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })

      throw error
    }
  }

  async syncPedido(pedido: Pedido): Promise<void> {
    try {
      // Ensure customer is synced first
      if (pedido.cliente && !pedido.cliente.quickbooksId) {
        await this.syncCliente(pedido.cliente)
      }

      // Ensure all items are synced
      for (const item of pedido.itens) {
        if (item.produto && !item.produto.quickbooksId) {
          await this.syncProduto(item.produto)
        }
      }

      let quickbooksInvoice

      if (pedido.quickbooksId) {
        // Update existing invoice
        const existing = await this.invoiceService.getInvoice(pedido.quickbooksId)
        quickbooksInvoice = await this.invoiceService.updateInvoice(pedido.quickbooksId, pedido, existing.SyncToken)
      } else {
        // Create new invoice
        quickbooksInvoice = await this.invoiceService.createInvoice(pedido)
      }

      // Update local database
      await api.put(`/pedidos/${pedido.id}`, {
        quickbooksId: quickbooksInvoice.Id,
        syncedAt: new Date(),
        syncStatus: "synced",
      })

      // Log success
      await this.createSyncLog({
        entityType: "pedido",
        entityId: pedido.id,
        action: pedido.quickbooksId ? "update" : "create",
        status: "success",
        quickbooksId: quickbooksInvoice.Id,
      })
    } catch (error) {
      console.error("Error syncing pedido:", error)

      // Update local database with error status
      await api.put(`/pedidos/${pedido.id}`, {
        syncStatus: "error",
      })

      // Log error
      await this.createSyncLog({
        entityType: "pedido",
        entityId: pedido.id,
        action: pedido.quickbooksId ? "update" : "create",
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })

      throw error
    }
  }

  async syncAll(): Promise<void> {
    try {
      // Sync all customers
      const clientes = await api.get("/clientes").then((res) => res.data)
      for (const cliente of clientes) {
        await this.syncCliente(cliente)
      }

      // Sync all products
      const produtos = await api.get("/produtos").then((res) => res.data)
      for (const produto of produtos) {
        await this.syncProduto(produto)
      }

      // Sync all orders
      const pedidos = await api.get("/pedidos").then((res) => res.data)
      for (const pedido of pedidos) {
        await this.syncPedido(pedido)
      }
    } catch (error) {
      console.error("Error during full sync:", error)
      throw error
    }
  }

  private async createSyncLog(log: Omit<SyncLog, "id" | "createdAt" | "updatedAt">): Promise<void> {
    try {
      await api.post("/sync-logs", log)
    } catch (error) {
      console.error("Error creating sync log:", error)
    }
  }
}
