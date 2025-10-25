import { NextResponse } from "next/server"
import { estimateService } from "@/lib/quickbooks/services/estimate.service"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, syncToken } = body

    if (!status || !syncToken) {
      return NextResponse.json({ error: "Status e SyncToken são obrigatórios" }, { status: 400 })
    }

    const validStatuses = ["Pending", "Accepted", "Closed", "Rejected"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    const estimate = await estimateService.updateEstimateStatus(params.id, status, syncToken)

    return NextResponse.json(estimate)
  } catch (error: any) {
    console.error("Error updating estimate status:", error)
    return NextResponse.json({ error: error.message || "Erro ao atualizar status do orçamento" }, { status: 500 })
  }
}
