import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { qbClient } from "@/lib/quickbooks/client"

export async function GET() {
  try {
    const response = await qbClient.query("SELECT * FROM Customer MAXRESULTS 1000")
    const customers = response.QueryResponse?.Customer || []

    // Sincronizar com banco local
    for (const customer of customers) {
      await prisma.cliente.upsert({
        where: { quickbooksId: customer.Id },
        update: {
          nome: customer.DisplayName,
          email: customer.PrimaryEmailAddr?.Address || "",
          telefone: customer.PrimaryPhone?.FreeFormNumber || "",
          endereco: customer.BillAddr?.Line1 || "",
          syncedAt: new Date(),
          syncStatus: "synced",
        },
        create: {
          nome: customer.DisplayName,
          email: customer.PrimaryEmailAddr?.Address || "",
          telefone: customer.PrimaryPhone?.FreeFormNumber || "",
          tipoDocumento: "cpf",
          documento: customer.ResaleNum || `QB-${customer.Id}`,
          endereco: customer.BillAddr?.Line1 || "",
          quickbooksId: customer.Id,
          syncedAt: new Date(),
          syncStatus: "synced",
        },
      })
    }

    return NextResponse.json(customers)
  } catch (error: any) {
    console.error("Erro ao buscar clientes:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar clientes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const qbData = {
      DisplayName: body.DisplayName,
      CompanyName: body.CompanyName || body.DisplayName,
      GivenName: body.GivenName || "",
      FamilyName: body.FamilyName || "",
      MiddleName: body.MiddleName || "",
      Title: body.Title || "",
      Suffix: body.Suffix || "",
      PrimaryEmailAddr: body.PrimaryEmailAddr ? { Address: body.PrimaryEmailAddr.Address } : undefined,
      PrimaryPhone: body.PrimaryPhone ? { FreeFormNumber: body.PrimaryPhone.FreeFormNumber } : undefined,
      AlternatePhone: body.AlternatePhone ? { FreeFormNumber: body.AlternatePhone.FreeFormNumber } : undefined,
      Mobile: body.Mobile ? { FreeFormNumber: body.Mobile.FreeFormNumber } : undefined,
      Fax: body.Fax ? { FreeFormNumber: body.Fax.FreeFormNumber } : undefined,
      WebAddr: body.WebAddr ? { URI: body.WebAddr.URI } : undefined,
      BillAddr: body.BillAddr
        ? {
            Line1: body.BillAddr.Line1 || "",
            City: body.BillAddr.City || "",
            PostalCode: body.BillAddr.PostalCode || "",
            CountrySubDivisionCode: body.BillAddr.CountrySubDivisionCode || "",
            Country: body.BillAddr.Country || "USA",
            Lat: body.BillAddr.Lat || "",
            Long: body.BillAddr.Long || "",
          }
        : undefined,
      ShipAddr: body.ShipAddr
        ? {
            Line1: body.ShipAddr.Line1 || "",
            City: body.ShipAddr.City || "",
            PostalCode: body.ShipAddr.PostalCode || "",
            CountrySubDivisionCode: body.ShipAddr.CountrySubDivisionCode || "",
            Country: body.ShipAddr.Country || "USA",
          }
        : undefined,
      ResaleNum: body.ResaleNum || "",
      SecondaryTaxIdentifier: body.SecondaryTaxIdentifier || "",
      Taxable: body.Taxable ?? false,
      Active: body.Active ?? true,
      Notes: body.Notes || "",
      Job: body.Job ?? false,
      BillWithParent: body.BillWithParent ?? false,
      PreferredDeliveryMethod: body.PreferredDeliveryMethod || "None",
      GSTIN: body.GSTIN || "",
      GSTRegistrationType: body.GSTRegistrationType || "",
      TaxExemptionReasonId: body.TaxExemptionReasonId || undefined,
      PrintOnCheckName: body.PrintOnCheckName || body.DisplayName,
    }

    // Criar no QuickBooks
    const qbResponse = await qbClient.post("/customer?minorversion=75", qbData)

    // Criar no banco de dados local COM quickbooksId
    const cliente = await prisma.cliente.create({
      data: {
        nome: body.DisplayName,
        email: body.PrimaryEmailAddr?.Address || "",
        telefone: body.PrimaryPhone?.FreeFormNumber || "",
        tipoDocumento: "cpf",
        documento: body.ResaleNum || `QB-${qbResponse.Customer.Id}`,
        endereco: body.BillAddr?.Line1 || "",
        quickbooksId: qbResponse.Customer.Id, // SALVA O ID DO QUICKBOOKS
        syncedAt: new Date(),
        syncStatus: "synced",
      },
    })

    // Registrar log
    await prisma.syncLog.create({
      data: {
        entityType: "cliente",
        entityId: cliente.id,
        action: "create",
        status: "success",
        quickbooksId: qbResponse.Customer.Id,
        errorMessage: `Cliente ${cliente.nome} criado com sucesso no QuickBooks`,
      },
    })

    return NextResponse.json({
      ...qbResponse.Customer,
      localId: cliente.id,
    })
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error)

    await prisma.syncLog.create({
      data: {
        entityType: "cliente",
        action: "create",
        status: "error",
        errorMessage: error.message || "Erro ao criar cliente",
      },
    })

    return NextResponse.json(
      { error: error.response?.data || error.message || "Erro ao criar cliente" },
      { status: 500 },
    )
  }
}
