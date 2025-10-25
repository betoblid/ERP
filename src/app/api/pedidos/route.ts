import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { qbClient } from "@/lib/quickbooks/client"

export async function GET() {
  try {
    // Buscar faturas direto do QuickBooks
    const response = await qbClient.query("SELECT * FROM Invoice MAXRESULTS 1000")

    const invoices = response.QueryResponse?.Invoice || []

    return NextResponse.json(invoices)
  } catch (error: any) {
    console.error("Erro ao buscar pedidos:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar pedidos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Criar no banco de dados local primeiro
    const pedido = await prisma.pedido.create({
      data: {
        clienteId: body.clienteId,
        data: new Date(body.TxnDate || Date.now()),
        horario: body.horario || "10:00",
        endereco: body.endereco || "",
        status: "agendado",
        observacao: body.PrivateNote || "",
        syncStatus: "pending",
        itens: {
          create:
            body.Line?.map((line: any) => ({
              produtoId: line.localProdutoId,
              quantidade: line.SalesItemLineDetail.Qty,
              precoUnitario: line.SalesItemLineDetail.UnitPrice,
            })) || [],
        },
      },
    })

    // Buscar cliente no QuickBooks
    const cliente = await prisma.cliente.findUnique({
      where: { id: body.clienteId },
    })

    if (!cliente?.quickbooksId) {
      throw new Error("Cliente não sincronizado com QuickBooks")
    }

    // Preparar linhas da fatura
    const lineItems = await Promise.all(
      body.Line?.map(async (line: any) => {
        const produto = await prisma.produto.findUnique({
          where: { id: line.localProdutoId },
        })

        if (!produto?.quickbooksId) {
          throw new Error(`Produto ${produto?.nome} não sincronizado com QuickBooks`)
        }

        return {
          Amount: line.Amount,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: {
              value: produto.quickbooksId,
              name: produto.nome,
            },
            Qty: line.SalesItemLineDetail.Qty,
            UnitPrice: line.SalesItemLineDetail.UnitPrice,
          },
        }
      }) || [],
    )

    // Preparar dados para QuickBooks
    const qbData = {
      CustomerRef: {
        value: cliente.quickbooksId,
        name: cliente.nome,
      },
      TxnDate: body.TxnDate || new Date().toISOString().split("T")[0],
      DueDate: body.DueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      Line: lineItems,
      PrivateNote: body.PrivateNote || "",
      BillAddr: body.BillAddr || undefined,
      ShipAddr: body.ShipAddr || undefined,
    }

    // Criar fatura no QuickBooks
    const qbResponse = await qbClient.post("/invoice?minorversion=75", qbData)

    // Atualizar com ID do QuickBooks
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        quickbooksId: qbResponse.Invoice.Id,
        syncedAt: new Date(),
        syncStatus: "synced",
      },
    })

    // Registrar log
    await prisma.syncLog.create({
      data: {
        entity: "pedido",
        entityId: pedido.id,
        action: "create",
        status: "success",
        message: `Pedido #${pedido.id} criado com sucesso no QuickBooks`,
      },
    })

    return NextResponse.json({
      ...qbResponse.Invoice,
      localId: pedido.id,
    })
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error)

    await prisma.syncLog.create({
      data: {
        entity: "pedido",
        action: "create",
        status: "error",
        message: error.message || "Erro ao criar pedido",
        errorDetails: JSON.stringify(error.response?.data || error),
      },
    })

    return NextResponse.json(
      { error: error.response?.data || error.message || "Erro ao criar pedido" },
      { status: 500 },
    )
  }
}
