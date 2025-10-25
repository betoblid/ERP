import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const entrega = await prisma.entrega.findUnique({
      where: { id: Number.parseInt(params.id) },
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
    })

    if (!entrega) {
      return NextResponse.json({ error: "Entrega não encontrada" }, { status: 404 })
    }

    return NextResponse.json(entrega)
  } catch (error: any) {
    console.error("Error fetching entrega:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar entrega" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, nomeRecebedor, identidadeRecebedor, fotoComprovante } = body

    const updateData: any = {}

    if (status) {
      updateData.status = status
    }

    if (nomeRecebedor) {
      updateData.nomeRecebedor = nomeRecebedor
    }

    if (identidadeRecebedor) {
      updateData.identidadeRecebedor = identidadeRecebedor
    }

    if (fotoComprovante) {
      updateData.fotoComprovante = fotoComprovante
    }

    if (status === "entregue") {
      updateData.dataRecebimento = new Date()
    }

    const entrega = await prisma.entrega.update({
      where: { id: Number.parseInt(params.id) },
      data: updateData,
      include: {
        pedido: {
          include: {
            cliente: true,
          },
        },
      },
    })

    // Atualizar status do pedido também
    if (status === "entregue") {
      await prisma.pedido.update({
        where: { id: entrega.pedidoId },
        data: { status: "entregue" },
      })
    }

    return NextResponse.json(entrega)
  } catch (error: any) {
    console.error("Error updating entrega:", error)
    return NextResponse.json({ error: error.message || "Erro ao atualizar entrega" }, { status: 500 })
  }
}
