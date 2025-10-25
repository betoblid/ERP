import { NextResponse } from "next/server"
import { estimateService } from "@/lib/quickbooks/services/estimate.service"
import { z } from "zod"

const createEstimateSchema = z.object({
  customerId: z.string().min(1, "Cliente é obrigatório"),
  customerEmail: z.string().email().optional(),
  txnDate: z.string().min(1, "Data estimada é obrigatória"),
  expirationDate: z.string().optional(),
  acceptedDate: z.string().optional(),
  billAddr: z
    .object({
      Line1: z.string().optional(),
      Line2: z.string().optional(),
      City: z.string().optional(),
      CountrySubDivisionCode: z.string().optional(),
      PostalCode: z.string().optional(),
    })
    .optional(),
  shipAddr: z
    .object({
      Line1: z.string().optional(),
      Line2: z.string().optional(),
      City: z.string().optional(),
      CountrySubDivisionCode: z.string().optional(),
      PostalCode: z.string().optional(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        description: z.string().optional(),
        quantity: z.number().positive("Quantidade deve ser maior que zero"),
        unitPrice: z.number().min(0, "Preço deve ser maior ou igual a zero"),
        taxCode: z.string(),
      }),
    )
    .min(1, "Adicione pelo menos um item"),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAccountId: z.string().optional(),
  customerMemo: z.string().optional(),
  privateNote: z.string().optional(),
  taxCodeId: z.string().optional(),
  applyTaxAfterDiscount: z.boolean(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId") || undefined
    const status = searchParams.get("status") || undefined
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    const estimates = await estimateService.listEstimates({
      customerId,
      status,
      startDate,
      endDate,
    })

    return NextResponse.json(estimates)
  } catch (error: any) {
    console.error("Error listing estimates:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar orçamentos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createEstimateSchema.parse(body)

    const estimate = await estimateService.createEstimate(validatedData)

    return NextResponse.json(estimate, { status: 201 })
  } catch (error: any) {
    console.error("Error creating estimate:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: error.message || "Erro ao criar orçamento" }, { status: 500 })
  }
}
