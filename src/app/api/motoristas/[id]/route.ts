import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const motorista = await prisma.motorista.findUnique({
      where: { id: Number.parseInt(params.id) },
    })

    if (!motorista) {
      return NextResponse.json({ error: "Motorista não encontrado" }, { status: 404 })
    }

    return NextResponse.json(motorista)
  } catch (error: any) {
    console.error("Error fetching motorista:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar motorista" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const updateData: any = {}

    if (body.primeiroNome) updateData.primeiroNome = body.primeiroNome
    if (body.nomeCompleto) updateData.nomeCompleto = body.nomeCompleto
    if (body.celular) updateData.celular = body.celular
    if (body.operadora !== undefined) updateData.operadora = body.operadora
    if (body.email) updateData.email = body.email
    if (body.dataNascimento) updateData.dataNascimento = new Date(body.dataNascimento)
    if (body.telefone !== undefined) updateData.telefone = body.telefone
    if (body.cep) updateData.cep = body.cep
    if (body.endereco) updateData.endereco = body.endereco
    if (body.bairro) updateData.bairro = body.bairro
    if (body.cidade) updateData.cidade = body.cidade
    if (body.numero) updateData.numero = body.numero
    if (body.complemento !== undefined) updateData.complemento = body.complemento
    if (body.resideDesdeMes) updateData.resideDesdeMes = body.resideDesdeMes
    if (body.resideDesdeAno) updateData.resideDesdeAno = body.resideDesdeAno
    if (body.validadeCnh) updateData.validadeCnh = new Date(body.validadeCnh)
    if (body.anexoCnh !== undefined) updateData.anexoCnh = body.anexoCnh
    if (body.ativo !== undefined) updateData.ativo = body.ativo

    const motorista = await prisma.motorista.update({
      where: { id: Number.parseInt(params.id) },
      data: updateData,
    })

    return NextResponse.json(motorista)
  } catch (error: any) {
    console.error("Error updating motorista:", error)
    return NextResponse.json({ error: error.message || "Erro ao atualizar motorista" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.motorista.delete({
      where: { id: Number.parseInt(params.id) },
    })

    return NextResponse.json({ message: "Motorista excluído com sucesso" })
  } catch (error: any) {
    console.error("Error deleting motorista:", error)
    return NextResponse.json({ error: error.message || "Erro ao excluir motorista" }, { status: 500 })
  }
}
