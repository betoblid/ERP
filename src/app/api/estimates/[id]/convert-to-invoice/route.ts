import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { qbClient } from "@/lib/quickbooks/client"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> } // ⬅️ `params` é uma Promise
) {
  const { id } = await context.params // ⬅️ AQUI ESTÁ A CORREÇÃO PRINCIPAL ✅

  try {
    const body = await request.json()
    const { dataEntrega, horarioEntrega, motoristaId, veiculoId, observacoes } = body

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID do orçamento inválido" }, { status: 400 })
    }

    // 1. Buscar estimate no QuickBooks
    const estimateResponse = await qbClient.get(`/estimate/${id}?minorversion=75`)
    const estimate = estimateResponse.Estimate

    // 2. Buscar cliente no banco de dados usando quickbooksId
    const cliente = await prisma.cliente.findFirst({
      where: {
        quickbooksId: estimate.CustomerRef.value,
      },
    })

    if (!cliente) {
      throw new Error("Cliente não encontrado no banco de dados. Sincronize os clientes primeiro.")
    }

    // 3. Buscar motorista e veículo
    const motorista = await prisma.motorista.findUnique({
      where: { id: Number(motoristaId) },
    })

    const veiculo = await prisma.veiculo.findUnique({
      where: { id: Number(veiculoId) },
    })

    if (!motorista || !veiculo) {
      throw new Error("Motorista ou veículo não encontrado")
    }

    // 4. Criar invoice no QuickBooks
    const invoiceData = {
      CustomerRef: estimate.CustomerRef,
      TxnDate: new Date().toISOString().split("T")[0],
      DueDate: dataEntrega,
      Line: estimate.Line,
      BillAddr: estimate.BillAddr,
      CustomerMemo: {
        value: `Convertido do orçamento #${estimate.DocNumber}. ${observacoes || ""}`,
      },
    }

    const invoiceResponse = await qbClient.post("/invoice?minorversion=75", invoiceData)
    const invoice = invoiceResponse.Invoice

    // 5. Atualizar status do estimate para "Accepted"
    const updateEstimateData = {
      Id: estimate.Id,
      SyncToken: estimate.SyncToken,
      TxnStatus: "Accepted",
      sparse: true,
    }

    await qbClient.post("/estimate?minorversion=75&operation=update", updateEstimateData)

    // 6. Gerar número de pedido único
    const ultimoPedido = await prisma.pedido.findFirst({
      orderBy: { id: "desc" },
    })

    const proximoNumero = ultimoPedido ? Number(ultimoPedido.numero) + 1 : 1
    const numeroPedido = proximoNumero.toString().padStart(6, "0")

    // 7. Criar pedido no banco de dados
    const pedido = await prisma.pedido.create({
      data: {
        numero: numeroPedido,
        clienteId: cliente.id,
        data: new Date(dataEntrega),
        horario: horarioEntrega,
        endereco: estimate.BillAddr?.Line1 || cliente.endereco,
        observacao: observacoes,
        status: "agendado",
        quickbooksId: invoice.Id,
        estimateId: Number(id),
        syncedAt: new Date(),
        syncStatus: "synced",
        itens: {
          create: estimate.Line
            .filter((line: any) => line.DetailType === "SalesItemLineDetail")
            .map((line: any, index: number) => ({
              id: `${numeroPedido}-${index + 1}`,
              produtoId: 1, // ⚠️ Substitua com o ID real mapeado do produto do QuickBooks
              quantidade: line.SalesItemLineDetail?.Qty || 1,
              precoUnitario: line.SalesItemLineDetail?.UnitPrice || 0,
            })),
        },
      },
      include: {
        itens: true,
      },
    })

    // 8. Criar entrega vinculada
    const entrega = await prisma.entrega.create({
      data: {
        pedidoId: pedido.id,
        estimateId: Number(id),
        quickbooksInvoiceId: invoice.Id,
        dataEntrega: new Date(dataEntrega),
        horarioEntrega,
        motoristaId: Number(motoristaId),
        veiculoId: Number(veiculoId),
        status: "agendada",
        observacoes,
      },
    })

    // 9. Registrar log de sucesso
    await prisma.syncLog.create({
      data: {
        entityType: "estimate",
        entityId: Number(id),
        action: "update",
        status: "success",
        quickbooksId: invoice.Id,
        errorMessage: `Orçamento #${estimate.DocNumber} convertido em fatura #${invoice.DocNumber}`,
      },
    })

    return NextResponse.json({
      invoice,
      pedido,
      entrega,
      message: "Orçamento convertido em fatura com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao converter orçamento:", error)

    const { id } = await context.params // ⚠️ Repetido aqui para garantir acesso mesmo após erro

    await prisma.syncLog.create({
      data: {
        entityType: "estimate",
        entityId: Number(id),
        action: "update",
        status: "error",
        errorMessage: error.message || "Erro desconhecido ao converter orçamento",
      },
    })

    return NextResponse.json(
      { error: error.response?.data || error.message || "Erro ao converter orçamento" },
      { status: 500 }
    )
  }
}
