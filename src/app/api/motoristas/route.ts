import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ativo = searchParams.get("ativo")

    const where: any = {}
    if (ativo !== null) {
      where.ativo = ativo === "true"
    }

    const motoristas = await prisma.motorista.findMany({
      where,
      orderBy: {
        nomeCompleto: "asc",
      },
    })

    return NextResponse.json(motoristas)
  } catch (error: any) {
    console.error("Error fetching motoristas:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar motoristas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const motorista = await prisma.motorista.create({
      data: {
        primeiroNome: body.primeiroNome,
        nomeCompleto: body.nomeCompleto,
        celular: body.celular,
        operadora: body.operadora,
        cpf: body.cpf,
        email: body.email,
        dataNascimento: new Date(body.dataNascimento),
        rg: body.rg,
        orgaoEmissor: body.orgaoEmissor,
        ufEmissor: body.ufEmissor,
        municipioNasc: body.municipioNasc,
        dataEmissaoRg: new Date(body.dataEmissaoRg),
        telefone: body.telefone,
        nomeMae: body.nomeMae,
        nomePai: body.nomePai,
        pis: body.pis,
        pais: body.pais,
        sexo: body.sexo,
        cep: body.cep,
        endereco: body.endereco,
        bairro: body.bairro,
        cidade: body.cidade,
        numero: body.numero,
        complemento: body.complemento,
        resideDesdeMes: body.resideDesdeMes,
        resideDesdeAno: body.resideDesdeAno,
        numeroHabilitacao: body.numeroHabilitacao,
        cidadeCnh: body.cidadeCnh,
        categoriaCnh: body.categoriaCnh,
        dataEmissaoCnh: new Date(body.dataEmissaoCnh),
        validadeCnh: new Date(body.validadeCnh),
        dataPrimeiraCnh: new Date(body.dataPrimeiraCnh),
        codSegurancaCnh: body.codSegurancaCnh,
        anexoCnh: body.anexoCnh,
        ativo: body.ativo ?? true,
      },
    })

    return NextResponse.json(motorista)
  } catch (error: any) {
    console.error("Error creating motorista:", error)
    return NextResponse.json({ error: error.message || "Erro ao criar motorista" }, { status: 500 })
  }
}
