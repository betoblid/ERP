import { NextResponse } from "next/server"
import { estimateService } from "@/lib/quickbooks/services/estimate.service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const estimate = await estimateService.getEstimate(params.id)
    return NextResponse.json(estimate)
  } catch (error: any) {
    console.error("Error fetching estimate:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar orçamento" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { syncToken, fullUpdate, ...data } = body

    if (!syncToken) {
      return NextResponse.json({ error: "SyncToken é obrigatório" }, { status: 400 })
    }

    let estimate
    if (fullUpdate) {
      estimate = await estimateService.fullUpdateEstimate({
        ...data,
        Id: params.id,
        SyncToken: syncToken,
      })
    } else {
      estimate = await estimateService.updateEstimate(params.id, data, syncToken)
    }

    return NextResponse.json(estimate)
  } catch (error: any) {
    console.error("Error updating estimate:", error)
    return NextResponse.json({ error: error.message || "Erro ao atualizar orçamento" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const syncToken = searchParams.get("syncToken")

    if (!syncToken) {
      return NextResponse.json({ error: "SyncToken é obrigatório" }, { status: 400 })
    }

    const result = await estimateService.deleteEstimate(params.id, syncToken)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error deleting estimate:", error)
    return NextResponse.json({ error: error.message || "Erro ao deletar orçamento" }, { status: 500 })
  }
}
