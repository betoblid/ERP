import type { QuickBooksClient } from "../client"
import type { Produto, QuickBooksItem } from "@/@types"

export class ItemService {
  constructor(private client: QuickBooksClient) {}

  async createItem(produto: Produto): Promise<QuickBooksItem> {
    const itemData = {
      Name: produto.nome,
      Description: `${produto.nome} - ${produto.codigo}`,
      Type: "Inventory",
      UnitPrice: produto.preco,
      QtyOnHand: produto.estoque,
      InvStartDate: new Date().toISOString().split("T")[0],
      IncomeAccountRef: {
        value: process.env.QUICKBOOKS_INCOME_ACCOUNT_ID || "1",
        name: "Sales",
      },
      AssetAccountRef: {
        value: process.env.QUICKBOOKS_ASSET_ACCOUNT_ID || "2",
        name: "Inventory Asset",
      },
      ExpenseAccountRef: {
        value: process.env.QUICKBOOKS_EXPENSE_ACCOUNT_ID || "3",
        name: "Cost of Goods Sold",
      },
      TrackQtyOnHand: true,
    }

    const response = await this.client.post<{ Item: QuickBooksItem }>("/item", itemData)

    return response.Item
  }

  async updateItem(quickbooksId: string, produto: Produto, syncToken: string): Promise<QuickBooksItem> {
    const itemData = {
      Id: quickbooksId,
      SyncToken: syncToken,
      Name: produto.nome,
      Description: `${produto.nome} - ${produto.codigo}`,
      UnitPrice: produto.preco,
      QtyOnHand: produto.estoque,
      sparse: true,
    }

    const response = await this.client.post<{ Item: QuickBooksItem }>("/item", itemData)

    return response.Item
  }

  async getItem(quickbooksId: string): Promise<QuickBooksItem> {
    const response = await this.client.get<{ Item: QuickBooksItem }>(`/item/${quickbooksId}`)
    return response.Item
  }

  async queryItems(filter?: string): Promise<QuickBooksItem[]> {
    let query = "SELECT * FROM Item WHERE Type = 'Inventory'"
    if (filter) {
      query += ` AND ${filter}`
    }
    return await this.client.query<QuickBooksItem>(query)
  }

  async updateItemQuantity(quickbooksId: string, newQuantity: number, syncToken: string): Promise<QuickBooksItem> {
    const itemData = {
      Id: quickbooksId,
      SyncToken: syncToken,
      QtyOnHand: newQuantity,
      sparse: true,
    }

    const response = await this.client.post<{ Item: QuickBooksItem }>("/item", itemData)

    return response.Item
  }
}
