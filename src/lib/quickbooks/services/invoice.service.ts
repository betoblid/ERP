import { qbClient } from "../client"
import type { QuickBooksInvoice } from "@/types"
import type { Estimate } from "@/types/estimate"

export class InvoiceService {
  async createInvoiceFromEstimate(estimate: Estimate): Promise<QuickBooksInvoice> {
    const invoicePayload = {
      CustomerRef: estimate.CustomerRef,
      TxnDate: new Date().toISOString().split("T")[0],
      DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      Line: estimate.Line,
      BillEmail: estimate.BillEmail,
      BillAddr: estimate.BillAddr,
      ShipAddr: estimate.ShipAddr,
      CustomerMemo: estimate.CustomerMemo,
      TxnTaxDetail: estimate.TxnTaxDetail,
      ApplyTaxAfterDiscount: estimate.ApplyTaxAfterDiscount,
    }

    const response = await qbClient.post("/invoice?minorversion=75", invoicePayload)
    return response.Invoice
  }

  async getInvoice(id: string): Promise<QuickBooksInvoice> {
    const response = await qbClient.get(`/invoice/${id}?minorversion=75`)
    return response.Invoice
  }

  async listInvoices(filter?: {
    customerId?: string
    startDate?: string
    endDate?: string
  }): Promise<QuickBooksInvoice[]> {
    let query = "SELECT * FROM Invoice"
    const conditions: string[] = []

    if (filter?.customerId) {
      conditions.push(`CustomerRef = '${filter.customerId}'`)
    }

    if (filter?.startDate) {
      conditions.push(`TxnDate >= '${filter.startDate}'`)
    }

    if (filter?.endDate) {
      conditions.push(`TxnDate <= '${filter.endDate}'`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += " ORDERBY TxnDate DESC"

    const response = await qbClient.query(query)
    return response.QueryResponse?.Invoice || []
  }

  async sendInvoice(id: string, email?: string): Promise<QuickBooksInvoice> {
    const endpoint = email
      ? `/invoice/${id}/send?sendTo=${encodeURIComponent(email)}&minorversion=75`
      : `/invoice/${id}/send?minorversion=75`

    const response = await qbClient.post(endpoint, {})
    return response.Invoice
  }

  async downloadPDF(id: string): Promise<Buffer> {
    const response = await qbClient.get(`/invoice/${id}/pdf?minorversion=75`)
    return response
  }
}

export const invoiceService = new InvoiceService()
