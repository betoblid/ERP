import { type NextRequest, NextResponse } from "next/server"
import { qbClient } from "@/lib/quickbooks/client"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    let query = "SELECT * FROM Item WHERE Type='Inventory'"

    if (search) {
      query += ` AND Name LIKE '%${search}%'`
    }

    query += " MAXRESULTS 1000"

    const response = await qbClient.query(query)
    const items = response.QueryResponse?.Item || []

    return NextResponse.json(items)
  } catch (error: any) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar produtos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const itemData = {
      Name: body.Name,
      Type: "Inventory",
      TrackQtyOnHand: body.TrackQtyOnHand ?? true,
      QtyOnHand: Number.parseInt(body.QtyOnHand) || 0,
      InvStartDate: body.InvStartDate || new Date().toISOString().split("T")[0],
      IncomeAccountRef: body.IncomeAccountRef || {
        name: "Sales of Product Income",
        value: "79",
      },
      AssetAccountRef: body.AssetAccountRef || {
        name: "Inventory Asset",
        value: "81",
      },
      ExpenseAccountRef: body.ExpenseAccountRef || {
        name: "Cost of Goods Sold",
        value: "80",
      },
      Active: body.Active ?? true,
      UnitPrice: Number.parseFloat(body.UnitPrice) || 0,
      PurchaseCost: Number.parseFloat(body.PurchaseCost) || 0,
      Description: body.Description || "",
      PurchaseDesc: body.PurchaseDesc || "",
      Taxable: body.Taxable ?? true,
    }

    const response = await qbClient.post("/item?minorversion=75", itemData)

    await prisma.syncLog.create({
      data: {
        entityType: "produto",
        entityId: Number.parseInt(response.Item.Id),
        action: "create",
        status: "success",
        quickbooksId: response.Item.Id,
      },
    })

    return NextResponse.json(response.Item)
  } catch (error: any) {
    console.error("Erro ao criar produto:", error)

    await prisma.syncLog.create({
      data: {
        entityType: "produto",
        entityId: 0,
        action: "create",
        status: "error",
        errorMessage: error.response?.data?.Fault?.Error?.[0]?.Message || error.message,
      },
    })

    return NextResponse.json(
      { error: error.response?.data || error.message || "Erro ao criar produto" },
      { status: 500 },
    )
  }
}
