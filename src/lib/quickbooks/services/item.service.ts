import type { QuickBooksClient } from "../client"
import type { Produto } from "@prisma/client"

export class ItemService {
  constructor(private client: QuickBooksClient) {}

  async createItem(produto: Produto & { categoria: { nome: string } }) {
    const itemData = {
      Name: produto.nome,
      Description: produto.descricao || produto.nome,
      Type: "Inventory",
      IncomeAccountRef: {
        value: process.env.QUICKBOOKS_INCOME_ACCOUNT_ID || "79",
      },
      AssetAccountRef: {
        value: process.env.QUICKBOOKS_ASSET_ACCOUNT_ID || "81",
      },
      ExpenseAccountRef: {
        value: process.env.QUICKBOOKS_EXPENSE_ACCOUNT_ID || "80",
      },
      TrackQtyOnHand: true,
      QtyOnHand: produto.estoqueAtual,
      InvStartDate: new Date().toISOString().split("T")[0],
      UnitPrice: produto.preco,
    }

    return this.client.post("/item", itemData)
  }

  async updateItem(quickbooksId: string, produto: Produto & { categoria: { nome: string } }) {
    // First, get the current item to get the SyncToken
    const currentItem: any = await this.client.get(`/item/${quickbooksId}`)

    const itemData = {
      ...currentItem.Item,
      Name: produto.nome,
      Description: produto.descricao || produto.nome,
      QtyOnHand: produto.estoqueAtual,
      UnitPrice: produto.preco,
      sparse: true,
    }

    return this.client.post(`/item?operation=update`, itemData)
  }

  async getItem(quickbooksId: string) {
    return this.client.get(`/item/${quickbooksId}`)
  }
}
