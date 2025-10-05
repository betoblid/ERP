import type { QuickBooksClient } from "../client"
import type { Cliente, QuickBooksCustomer } from "@/@types"

export class CustomerService {
  constructor(private client: QuickBooksClient) {}

  async createCustomer(cliente: Cliente): Promise<QuickBooksCustomer> {
    const customerData = {
      DisplayName: cliente.nome,
      PrimaryEmailAddr: {
        Address: cliente.email,
      },
      PrimaryPhone: {
        FreeFormNumber: cliente.telefone,
      },
      BillAddr: {
        Line1: cliente.endereco,
      },
      CompanyName: cliente.nome,
      GivenName: cliente.nome.split(" ")[0],
      FamilyName: cliente.nome.split(" ").slice(1).join(" "),
    }

    const response = await this.client.post<{ Customer: QuickBooksCustomer }>("/customer", customerData)

    return response.Customer
  }

  async updateCustomer(quickbooksId: string, cliente: Cliente, syncToken: string): Promise<QuickBooksCustomer> {
    const customerData = {
      Id: quickbooksId,
      SyncToken: syncToken,
      DisplayName: cliente.nome,
      PrimaryEmailAddr: {
        Address: cliente.email,
      },
      PrimaryPhone: {
        FreeFormNumber: cliente.telefone,
      },
      BillAddr: {
        Line1: cliente.endereco,
      },
      sparse: true,
    }

    const response = await this.client.post<{ Customer: QuickBooksCustomer }>("/customer", customerData)

    return response.Customer
  }

  async getCustomer(quickbooksId: string): Promise<QuickBooksCustomer> {
    const response = await this.client.get<{ Customer: QuickBooksCustomer }>(`/customer/${quickbooksId}`)
    return response.Customer
  }

  async queryCustomers(filter?: string): Promise<QuickBooksCustomer[]> {
    let query = "SELECT * FROM Customer"
    if (filter) {
      query += ` WHERE ${filter}`
    }
    return await this.client.query<QuickBooksCustomer>(query)
  }

  async deleteCustomer(quickbooksId: string, syncToken: string): Promise<void> {
    await this.client.post("/customer", {
      Id: quickbooksId,
      SyncToken: syncToken,
      Active: false,
    })
  }
}
