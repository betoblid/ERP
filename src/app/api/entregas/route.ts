import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (dataInicio || dataFim) {
      where.dataEntrega = {}
      if (dataInicio) where.dataEntrega.gte = new Date(dataInicio)
      if (dataFim) where.dataEntrega.lte = new Date(dataFim)
    }

    const entregas = await prisma.entrega.findMany({
      where,
      include: {
        pedido: {
          include: {
            cliente: true,
            itens: {
              include: {
                produto: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataEntrega: "asc",
      },
    })

    return NextResponse.json(entregas)
  } catch (error: any) {
    console.error("Error fetching entregas:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar entregas" }, { status: 500 })
  }
}
