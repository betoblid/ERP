import type { QuickBooksClient } from "../client"
import { PrismaClient, type Produto } from "@prisma/client"

const prisma = new PrismaClient()

export class ItemService {
  constructor(private client: QuickBooksClient) {}

  async createItem(produto: Produto & { categoria: { nome: string } }) {
    console.log(`Criando item no QuickBooks: ${produto.nome}`)

    const incomeAccountId = process.env.QUICKBOOKS_INCOME_ACCOUNT_ID || "79"
    const assetAccountId = process.env.QUICKBOOKS_ASSET_ACCOUNT_ID || "81"
    const expenseAccountId = process.env.QUICKBOOKS_EXPENSE_ACCOUNT_ID || "80"

    const itemData: any = {
      Name: produto.nome,
      Description: produto.categoria?.nome || "Produto",
      Type: "Inventory",
      TrackQtyOnHand: true,
      QtyOnHand: produto.estoqueAtual || 0,
      InvStartDate: new Date().toISOString().split("T")[0],
      UnitPrice: produto.preco,
      IncomeAccountRef: {
        value: incomeAccountId,
        name: "Sales of Product Income",
      },
      AssetAccountRef: {
        value: assetAccountId,
        name: "Inventory Asset",
      },
      ExpenseAccountRef: {
        value: expenseAccountId,
        name: "Cost of Goods Sold",
      },
    }

    if (produto.codigo) {
      itemData.Sku = produto.codigo
    }

    const response = await this.client.post("/item", itemData)

    const qbItemId = response.Item.Id

    await prisma.produto.update({
      where: { id: produto.id },
      data: {
        quickbooksId: qbItemId,
        syncedAt: new Date(),
        syncStatus: "synced",
      },
    })

    await prisma.syncLog.create({
      data: {
        entityType: "produto",
        entityId: produto.id,
        action: "create",
        status: "success",
        quickbooksId: qbItemId,
      },
    })

    console.log(`Item criado no QuickBooks com ID: ${qbItemId}`)

    return response.Item
  }

  async updateItem(produto: Produto & { categoria: { nome: string } }) {
    if (!produto.quickbooksId) {
      throw new Error("Produto não possui ID do QuickBooks")
    }

    console.log(`Atualizando item no QuickBooks: ${produto.nome}`)

    const existingItem = await this.client.get(`/item/${produto.quickbooksId}`)
    const syncToken = existingItem.Item.SyncToken

    const updateData: any = {
      Id: produto.quickbooksId,
      SyncToken: syncToken,
      sparse: true,
      Name: produto.nome,
      UnitPrice: produto.preco,
    }

    if (produto.categoria?.nome) {
      updateData.Description = produto.categoria.nome
    }

    const response = await this.client.post("/item", updateData)

    await prisma.produto.update({
      where: { id: produto.id },
      data: {
        syncedAt: new Date(),
        syncStatus: "synced",
      },
    })

    await prisma.syncLog.create({
      data: {
        entityType: "produto",
        entityId: produto.id,
        action: "update",
        status: "success",
        quickbooksId: produto.quickbooksId,
      },
    })

    console.log(`Item atualizado no QuickBooks`)

    return response.Item
  }

  async getItemById(quickbooksId: string) {
    const response = await this.client.get(`/item/${quickbooksId}`)
    return response.Item
  }

  async queryItems(filter?: string) {
    let query = "SELECT * FROM Item WHERE Type='Inventory'"
    if (filter) {
      query += ` AND ${filter}`
    }
    return await this.client.query(query)
  }
}
