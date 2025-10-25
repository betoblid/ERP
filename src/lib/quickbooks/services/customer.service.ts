import type { QuickBooksClient } from "../client"
import { PrismaClient, type Cliente } from "@prisma/client"

const prisma = new PrismaClient()

export class CustomerService {
  constructor(private client: QuickBooksClient) {}

  async createCustomer(cliente: Cliente) {
    console.log(`Criando cliente no QuickBooks: ${cliente.nome}`)

    const customerData: any = {
      DisplayName: cliente.nome,
      GivenName: cliente.nome.split(" ")[0],
      FamilyName: cliente.nome.split(" ").slice(1).join(" ") || cliente.nome.split(" ")[0],
    }

    if (cliente.email) {
      customerData.PrimaryEmailAddr = { Address: cliente.email }
    }

    if (cliente.telefone) {
      customerData.PrimaryPhone = { FreeFormNumber: cliente.telefone }
    }

    if (cliente.endereco) {
      customerData.BillAddr = {
        Line1: cliente.endereco,
      }
    }

    if (cliente.tipoDocumento === "cnpj") {
      customerData.CompanyName = cliente.nome
    }

    const response = await this.client.post("/customer", customerData)

    const qbCustomerId = response.Customer.Id
    const syncToken = response.Customer.SyncToken

    await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        quickbooksId: qbCustomerId,
        syncedAt: new Date(),
        syncStatus: "synced",
      },
    })

    await prisma.syncLog.create({
      data: {
        entityType: "cliente",
        entityId: cliente.id,
        action: "create",
        status: "success",
        quickbooksId: qbCustomerId,
      },
    })

    console.log(`Cliente criado no QuickBooks com ID: ${qbCustomerId}`)

    return response.Customer
  }

  async updateCustomer(cliente: Cliente) {
    if (!cliente.quickbooksId) {
      throw new Error("Cliente não possui ID do QuickBooks")
    }

    console.log(`Atualizando cliente no QuickBooks: ${cliente.nome}`)

    const existingCustomer = await this.client.get(`/customer/${cliente.quickbooksId}`)
    const syncToken = existingCustomer.Customer.SyncToken

    const updateData: any = {
      Id: cliente.quickbooksId,
      SyncToken: syncToken,
      sparse: true,
    }

    if (cliente.nome) {
      updateData.DisplayName = cliente.nome
      updateData.GivenName = cliente.nome.split(" ")[0]
      updateData.FamilyName = cliente.nome.split(" ").slice(1).join(" ") || cliente.nome.split(" ")[0]
    }

    if (cliente.email) {
      updateData.PrimaryEmailAddr = { Address: cliente.email }
    }

    if (cliente.telefone) {
      updateData.PrimaryPhone = { FreeFormNumber: cliente.telefone }
    }

    if (cliente.endereco) {
      updateData.BillAddr = { Line1: cliente.endereco }
    }

    const response = await this.client.post("/customer", updateData)

    await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        syncedAt: new Date(),
        syncStatus: "synced",
      },
    })

    await prisma.syncLog.create({
      data: {
        entityType: "cliente",
        entityId: cliente.id,
        action: "update",
        status: "success",
        quickbooksId: cliente.quickbooksId,
      },
    })

    console.log(`Cliente atualizado no QuickBooks`)

    return response.Customer
  }

  async getCustomerById(quickbooksId: string) {
    const response = await this.client.get(`/customer/${quickbooksId}`)
    return response.Customer
  }

  async queryCustomers(filter?: string) {
    let query = "SELECT * FROM Customer"
    if (filter) {
      query += ` WHERE ${filter}`
    }
    return await this.client.query(query)
  }
}
