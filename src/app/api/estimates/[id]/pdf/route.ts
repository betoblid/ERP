import { NextResponse } from "next/server"
import { estimateService } from "@/lib/quickbooks/services/estimate.service"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const pdfBuffer = await estimateService.downloadPDF(id)

    if (!pdfBuffer) {
      return NextResponse.json({ error: "PDF não encontrado ou inválido" }, { status: 404 })
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="estimate-${id}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("Error downloading PDF:", error.response?.data || error.message)

    return NextResponse.json(
      {
        error: error.response?.data || error.message || "Erro ao baixar PDF"
      },
      {
        status: error.response?.status || 500,
      }
    )
  }
}
