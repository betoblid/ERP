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

    const veiculos = await prisma.veiculo.findMany({
      where,
      orderBy: {
        placa: "asc",
      },
    })

    return NextResponse.json(veiculos)
  } catch (error: any) {
    console.error("Error fetching veiculos:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar veículos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const veiculo = await prisma.veiculo.create({
      data: {
        placa: body.placa.toUpperCase(),
        renavam: body.renavam,
        marca: body.marca,
        modelo: body.modelo,
        anoFabricacao: Number.parseInt(body.anoFabricacao),
        anoModelo: Number.parseInt(body.anoModelo),
        cor: body.cor,
        dataCompra: new Date(body.dataCompra),
        baseOperacao: body.baseOperacao,
        tipoVeiculo: body.tipoVeiculo,
        categoriaFrota: body.categoriaFrota,
        seguradora: body.seguradora,
        vigencia: body.vigencia ? new Date(body.vigencia) : null,
        taraVeiculo: body.taraVeiculo ? Number.parseFloat(body.taraVeiculo) : null,
        capacidadeCarga: body.capacidadeCarga ? Number.parseFloat(body.capacidadeCarga) : null,
        capacidadeCargaM3: body.capacidadeCargaM3 ? Number.parseFloat(body.capacidadeCargaM3) : null,
        tipoCarroceria: body.tipoCarroceria,
        ufEmplacada: body.ufEmplacada,
        tipoRodado: body.tipoRodado,
        certificadoCronotacografo: body.certificadoCronotacografo,
        medidasRodado: body.medidasRodado,
        consumoKmLitro: body.consumoKmLitro ? Number.parseFloat(body.consumoKmLitro) : null,
        kmMaximoRota: body.kmMaximoRota ? Number.parseFloat(body.kmMaximoRota) : null,
        capacidadeTanque: body.capacidadeTanque ? Number.parseFloat(body.capacidadeTanque) : null,
        tipoResponsavel: body.tipoResponsavel,
        unidadeProprietaria: body.unidadeProprietaria,
        financiamento: body.financiamento,
        instituicaoFinanceira: body.instituicaoFinanceira,
        tabela: body.tabela,
        valorEntrega: body.valorEntrega ? Number.parseFloat(body.valorEntrega) : null,
        valorKmRodado: body.valorKmRodado ? Number.parseFloat(body.valorKmRodado) : null,
        valorDiaria: body.valorDiaria ? Number.parseFloat(body.valorDiaria) : null,
        ativo: body.ativo ?? true,
      },
    })

    return NextResponse.json(veiculo)
  } catch (error: any) {
    console.error("Error creating veiculo:", error)
    return NextResponse.json({ error: error.message || "Erro ao criar veículo" }, { status: 500 })
  }
}
