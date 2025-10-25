import { type NextRequest, NextResponse } from "next/server"
import { qbClient } from "@/lib/quickbooks/client"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    let query = "SELECT * FROM Item WHERE Type='Category'"

    if (search) {
      query += ` AND Name LIKE '%${search}%'`
    }

    query += " MAXRESULTS 1000"

    const response = await qbClient.query(query)
    const categories = response.QueryResponse?.Item || []

    return NextResponse.json(categories)
  } catch (error: any) {
    console.error("Erro ao buscar categorias:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar categorias" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const categoryData: any = {
      Name: body.Name,
      Type: "Category",
      SubItem: body.SubItem ?? false,
    }

    if (body.SubItem && body.ParentRef) {
      categoryData.ParentRef = body.ParentRef
    }

    const response = await qbClient.post("/item?minorversion=4", categoryData)

    await prisma.syncLog.create({
      data: {
        entityType: "categoria",
        entityId: Number.parseInt(response.Item.Id),
        action: "create",
        status: "success",
        quickbooksId: response.Item.Id,
      },
    })

    return NextResponse.json(response.Item)
  } catch (error: any) {
    console.error("Erro ao criar categoria:", error)

    await prisma.syncLog.create({
      data: {
        entityType: "categoria",
        entityId: 0,
        action: "create",
        status: "error",
        errorMessage: error.response?.data?.Fault?.Error?.[0]?.Message || error.message,
      },
    })

    return NextResponse.json(
      { error: error.response?.data || error.message || "Erro ao criar categoria" },
      { status: 500 },
    )
  }
}
