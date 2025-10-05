import type { QuickBooksClient } from "../client"

export class InvoiceService {
  constructor(private client: QuickBooksClient) {}

  async createInvoice(pedido: any) {
    const invoiceData = {
      CustomerRef: {
        value: pedido.cliente.quickbooksId,
      },
      TxnDate: new Date(pedido.data).toISOString().split("T")[0],
      Line: pedido.itens.map((item: any) => ({
        Amount: item.quantidade * item.precoUnitario,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: {
            value: item.produto.quickbooksId,
          },
          Qty: item.quantidade,
          UnitPrice: item.precoUnitario,
        },
      })),
      CustomerMemo: {
        value: pedido.observacao || "",
      },
    }

    return this.client.post("/invoice", invoiceData)
  }

  async updateInvoice(quickbooksId: string, pedido: any) {
    // First, get the current invoice to get the SyncToken
    const currentInvoice: any = await this.client.get(`/invoice/${quickbooksId}`)

    const invoiceData = {
      ...currentInvoice.Invoice,
      Line: pedido.itens.map((item: any) => ({
        Amount: item.quantidade * item.precoUnitario,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: {
            value: item.produto.quickbooksId,
          },
          Qty: item.quantidade,
          UnitPrice: item.precoUnitario,
        },
      })),
      CustomerMemo: {
        value: pedido.observacao || "",
      },
      sparse: true,
    }

    return this.client.post(`/invoice?operation=update`, invoiceData)
  }

  async getInvoice(quickbooksId: string) {
    return this.client.get(`/invoice/${quickbooksId}`)
  }
}
