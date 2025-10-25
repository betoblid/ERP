import { type NextRequest, NextResponse } from "next/server"
import { qbClient } from "@/lib/quickbooks/client"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await qbClient.get(`/item/${params.id}?minorversion=4`)
    return NextResponse.json(response.Item)
  } catch (error: any) {
    console.error("Erro ao buscar categoria:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar categoria" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const currentCategory = await qbClient.get(`/item/${params.id}?minorversion=4`)

    const updateData = {
      ...currentCategory.Item,
      Name: body.Name,
      Id: params.id,
      SyncToken: currentCategory.Item.SyncToken,
      Type: "Category",
      sparse: false,
    }

    const response = await qbClient.post("/item?minorversion=4", updateData)

    await prisma.syncLog.create({
      data: {
        entityType: "categoria",
        entityId: Number.parseInt(params.id),
        action: "update",
        status: "success",
        quickbooksId: params.id,
      },
    })

    return NextResponse.json(response.Item)
  } catch (error: any) {
    console.error("Erro ao atualizar categoria:", error)

    await prisma.syncLog.create({
      data: {
        entityType: "categoria",
        entityId: Number.parseInt(params.id),
        action: "update",
        status: "error",
        errorMessage: error.response?.data?.Fault?.Error?.[0]?.Message || error.message,
        quickbooksId: params.id,
      },
    })

    return NextResponse.json(
      { error: error.response?.data || error.message || "Erro ao atualizar categoria" },
      { status: 500 },
    )
  }
}
