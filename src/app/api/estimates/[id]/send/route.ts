import { NextResponse } from "next/server"
import { estimateService } from "@/lib/quickbooks/services/estimate.service"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email") || undefined

    const estimate = await estimateService.sendEstimate(params.id, email)
    return NextResponse.json(estimate)
  } catch (error: any) {
    console.error("Error sending estimate:", error)
    return NextResponse.json({ error: error.message || "Erro ao enviar orçamento" }, { status: 500 })
  }
}
