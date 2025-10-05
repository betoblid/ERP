import type { QuickBooksClient } from "../client"
import type { Cliente } from "@prisma/client"

export class CustomerService {
  constructor(private client: QuickBooksClient) {}

  async createCustomer(cliente: Cliente) {
    const customerData = {
      DisplayName: cliente.nome,
      PrimaryEmailAddr: { Address: cliente.email },
      PrimaryPhone: { FreeFormNumber: cliente.telefone },
      BillAddr: {
        Line1: cliente.endereco,
      },
      CompanyName: cliente.nome,
      GivenName: cliente.nome.split(" ")[0],
      FamilyName: cliente.nome.split(" ").slice(1).join(" "),
    }

    return this.client.post("/customer", customerData)
  }

  async updateCustomer(quickbooksId: string, cliente: Cliente) {
    // First, get the current customer to get the SyncToken
    const currentCustomer: any = await this.client.get(`/customer/${quickbooksId}`)

    const customerData = {
      ...currentCustomer.Customer,
      DisplayName: cliente.nome,
      PrimaryEmailAddr: { Address: cliente.email },
      PrimaryPhone: { FreeFormNumber: cliente.telefone },
      BillAddr: {
        Line1: cliente.endereco,
      },
      sparse: true,
    }

    return this.client.post(`/customer?operation=update`, customerData)
  }

  async getCustomer(quickbooksId: string) {
    return this.client.get(`/customer/${quickbooksId}`)
  }
}
