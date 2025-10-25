import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const veiculo = await prisma.veiculo.findUnique({
      where: { id: Number.parseInt(params.id) },
    })

    if (!veiculo) {
      return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 })
    }

    return NextResponse.json(veiculo)
  } catch (error: any) {
    console.error("Error fetching veiculo:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar veículo" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const updateData: any = {}

    if (body.placa) updateData.placa = body.placa.toUpperCase()
    if (body.seguradora !== undefined) updateData.seguradora = body.seguradora
    if (body.vigencia) updateData.vigencia = new Date(body.vigencia)
    if (body.consumoKmLitro !== undefined) updateData.consumoKmLitro = Number.parseFloat(body.consumoKmLitro)
    if (body.kmMaximoRota !== undefined) updateData.kmMaximoRota = Number.parseFloat(body.kmMaximoRota)
    if (body.capacidadeTanque !== undefined) updateData.capacidadeTanque = Number.parseFloat(body.capacidadeTanque)
    if (body.valorEntrega !== undefined) updateData.valorEntrega = Number.parseFloat(body.valorEntrega)
    if (body.valorKmRodado !== undefined) updateData.valorKmRodado = Number.parseFloat(body.valorKmRodado)
    if (body.valorDiaria !== undefined) updateData.valorDiaria = Number.parseFloat(body.valorDiaria)
    if (body.ativo !== undefined) updateData.ativo = body.ativo

    const veiculo = await prisma.veiculo.update({
      where: { id: Number.parseInt(params.id) },
      data: updateData,
    })

    return NextResponse.json(veiculo)
  } catch (error: any) {
    console.error("Error updating veiculo:", error)
    return NextResponse.json({ error: error.message || "Erro ao atualizar veículo" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.veiculo.delete({
      where: { id: Number.parseInt(params.id) },
    })

    return NextResponse.json({ message: "Veículo excluído com sucesso" })
  } catch (error: any) {
    console.error("Error deleting veiculo:", error)
    return NextResponse.json({ error: error.message || "Erro ao excluir veículo" }, { status: 500 })
  }
}
