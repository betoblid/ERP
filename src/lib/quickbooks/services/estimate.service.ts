import { qbClient } from "../client"
import type { Estimate, EstimateFormData, EstimateListItem } from "@/types/estimate"

export class EstimateService {
  async createEstimate(data: EstimateFormData): Promise<Estimate> {
    const lines: any[] = []

    data.items.forEach((item, index) => {
      lines.push({
        LineNum: index + 1,
        Description: item.description || "",
        DetailType: "SalesItemLineDetail",
        Amount: item.quantity * item.unitPrice,
        SalesItemLineDetail: {
          ItemRef: {
            value: item.productId,
          },
          Qty: item.quantity,
          UnitPrice: item.unitPrice,
          TaxCodeRef: {
            value: item.taxCode,
          },
        },
      })
    })

    const subtotal = lines.reduce((sum, line) => sum + line.Amount, 0)

    lines.push({
      DetailType: "SubTotalLineDetail",
      Amount: subtotal,
      SubTotalLineDetail: {},
    })

    if (data.discountPercent && data.discountPercent > 0) {
      lines.push({
        DetailType: "DiscountLineDetail",
        Amount: subtotal * (data.discountPercent / 100),
        DiscountLineDetail: {
          DiscountAccountRef: {
            value: data.discountAccountId || "86",
          },
          PercentBased: true,
          DiscountPercent: data.discountPercent,
        },
      })
    }

    const payload: any = {
      TxnDate: data.txnDate,
      CustomerRef: {
        value: data.customerId,
      },
      Line: lines,
      ApplyTaxAfterDiscount: data.applyTaxAfterDiscount,
    }

    if (data.expirationDate) {
      payload.ExpirationDate = data.expirationDate
    }

    if (data.acceptedDate) {
      payload.AcceptedDate = data.acceptedDate
    }

    if (data.customerEmail) {
      payload.BillEmail = {
        Address: data.customerEmail,
      }
    }

    if (data.billAddr) {
      payload.BillAddr = data.billAddr
    }

    if (data.shipAddr) {
      payload.ShipAddr = data.shipAddr
    }

    if (data.customerMemo) {
      payload.CustomerMemo = {
        value: data.customerMemo,
      }
    }

    if (data.privateNote) {
      payload.PrivateNote = data.privateNote
    }

    if (data.taxCodeId) {
      payload.TxnTaxDetail = {
        TxnTaxCodeRef: {
          value: data.taxCodeId,
        },
      }
    }

    const response = await qbClient.post("/estimate?minorversion=75", payload)
    return response.Estimate
  }

  async getEstimate(id: string): Promise<Estimate> {
    const response = await qbClient.get(`/estimate/${id}?minorversion=75`)
    return response.Estimate
  }

  async listEstimates(filter?: {
    customerId?: string
    status?: string
    startDate?: string
    endDate?: string
  }): Promise<EstimateListItem[]> {
    let query = "SELECT * FROM Estimate"
    const conditions: string[] = []

    if (filter?.customerId) {
      conditions.push(`CustomerRef = '${filter.customerId}'`)
    }

    if (filter?.status) {
      conditions.push(`TxnStatus = '${filter.status}'`)
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
    return response.QueryResponse?.Estimate || []
  }

  async updateEstimate(id: string, data: Partial<Estimate>, syncToken: string): Promise<Estimate> {
    const payload = {
      ...data,
      Id: id,
      SyncToken: syncToken,
      sparse: true,
    }

    const response = await qbClient.post("/estimate?minorversion=75", payload)
    return response.Estimate
  }

  async updateEstimateStatus(
    id: string,
    status: "Pending" | "Accepted" | "Closed" | "Rejected",
    syncToken: string,
  ): Promise<Estimate> {
    const payload = {
      Id: id,
      SyncToken: syncToken,
      TxnStatus: status,
      sparse: true,
    }

    if (status === "Accepted") {
      payload.AcceptedDate = new Date().toISOString().split("T")[0]
    }

    const response = await qbClient.post("/estimate?minorversion=75", payload)
    return response.Estimate
  }

  async fullUpdateEstimate(estimate: Estimate): Promise<Estimate> {
    const response = await qbClient.post("/estimate?minorversion=75", estimate)
    return response.Estimate
  }

  async deleteEstimate(id: string, syncToken: string): Promise<{ status: string; Id: string }> {
    const response = await qbClient.post("/estimate?operation=delete&minorversion=75", {
      Id: id,
      SyncToken: syncToken,
    })
    return response.Estimate
  }

  async sendEstimate(id: string, email?: string): Promise<Estimate> {
    const endpoint = email
      ? `/estimate/${id}/send?sendTo=${encodeURIComponent(email)}&minorversion=75`
      : `/estimate/${id}/send?minorversion=75`

    const response = await qbClient.post(endpoint, {})
    return response.Estimate
  }

  async downloadPDF(id: string): Promise<Buffer> {
    const response = await qbClient.get(`/estimate/${id}/pdf?minorversion=75`)
    return response
  }
}

export const estimateService = new EstimateService()
