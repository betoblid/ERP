import type { QuickBooksClient } from "../client"
import type { Pedido, QuickBooksInvoice } from "@/@types"

export class InvoiceService {
  constructor(private client: QuickBooksClient) {}

  async createInvoice(pedido: Pedido): Promise<QuickBooksInvoice> {
    if (!pedido.cliente?.quickbooksId) {
      throw new Error("Cliente must be synced with QuickBooks first")
    }

    const lines = pedido.itens.map((item, index) => ({
      Amount: item.quantidade * item.precoUnitario,
      DetailType: "SalesItemLineDetail",
      Description: item.produto?.nome || "",
      LineNum: index + 1,
      SalesItemLineDetail: {
        ItemRef: {
          value: item.produto?.quickbooksId || "",
          name: item.produto?.nome || "",
        },
        Qty: item.quantidade,
        UnitPrice: item.precoUnitario,
        TaxCodeRef: {
          value: "NON",
        },
      },
    }))

    const invoiceData = {
      DocNumber: pedido.numero,
      TxnDate: new Date(pedido.data).toISOString().split("T")[0],
      CustomerRef: {
        value: pedido.cliente.quickbooksId,
        name: pedido.cliente.nome,
      },
      Line: lines,
      BillAddr: {
        Line1: pedido.endereco,
      },
      CustomerMemo: pedido.observacao
        ? {
            value: pedido.observacao,
          }
        : undefined,
      DueDate: new Date(pedido.data).toISOString().split("T")[0],
    }

    const response = await this.client.post<{ Invoice: QuickBooksInvoice }>("/invoice", invoiceData)

    return response.Invoice
  }

  async updateInvoice(quickbooksId: string, pedido: Pedido, syncToken: string): Promise<QuickBooksInvoice> {
    const lines = pedido.itens.map((item, index) => ({
      Amount: item.quantidade * item.precoUnitario,
      DetailType: "SalesItemLineDetail",
      Description: item.produto?.nome || "",
      LineNum: index + 1,
      SalesItemLineDetail: {
        ItemRef: {
          value: item.produto?.quickbooksId || "",
          name: item.produto?.nome || "",
        },
        Qty: item.quantidade,
        UnitPrice: item.precoUnitario,
        TaxCodeRef: {
          value: "NON",
        },
      },
    }))

    const invoiceData = {
      Id: quickbooksId,
      SyncToken: syncToken,
      DocNumber: pedido.numero,
      TxnDate: new Date(pedido.data).toISOString().split("T")[0],
      Line: lines,
      BillAddr: {
        Line1: pedido.endereco,
      },
      CustomerMemo: pedido.observacao
        ? {
            value: pedido.observacao,
          }
        : undefined,
      sparse: true,
    }

    const response = await this.client.post<{ Invoice: QuickBooksInvoice }>("/invoice", invoiceData)

    return response.Invoice
  }

  async getInvoice(quickbooksId: string): Promise<QuickBooksInvoice> {
    const response = await this.client.get<{ Invoice: QuickBooksInvoice }>(`/invoice/${quickbooksId}`)
    return response.Invoice
  }

  async queryInvoices(filter?: string): Promise<QuickBooksInvoice[]> {
    let query = "SELECT * FROM Invoice"
    if (filter) {
      query += ` WHERE ${filter}`
    }
    query += " ORDER BY TxnDate DESC"
    return await this.client.query<QuickBooksInvoice>(query)
  }

  async voidInvoice(quickbooksId: string, syncToken: string): Promise<void> {
    await this.client.post("/invoice", {
      Id: quickbooksId,
      SyncToken: syncToken,
      PrivateNote: "Voided from ERP System",
    })
  }

  async sendInvoice(quickbooksId: string, email: string): Promise<void> {
    await this.client.post(`/invoice/${quickbooksId}/send`, {
      SendTo: email,
    })
  }
}
