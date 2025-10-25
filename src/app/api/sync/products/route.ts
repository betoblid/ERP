import { NextResponse } from "next/server"
import { qbClient } from "@/lib/quickbooks/client"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    console.log("🔄 Iniciando sincronização de produtos do QuickBooks...")

    // Buscar todos os itens do QuickBooks
    const response = await qbClient.get(
      "/query?query=SELECT * FROM Item WHERE Type IN ('Inventory', 'NonInventory', 'Service') MAXRESULTS 1000&minorversion=75",
    )

    const items = response.QueryResponse?.Item || []

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhum produto encontrado no QuickBooks",
        synced: 0,
        created: 0,
        updated: 0,
      })
    }

    let created = 0
    let updated = 0
    const syncedProducts = []

    for (const item of items) {
      try {
        // Extrair dados do item
        const itemData = {
          quickbooksId: item.Id,
          nome: item.Name,
          descricao: item.Description || null,
          tipo: item.Type,
          sku: item.Sku || null,
          ativo: item.Active !== false,
        }

        // Determinar preço baseado no tipo
        let preco = 0
        if (item.Type === "Inventory" && item.QtyOnHand) {
          preco = Number.parseFloat(item.UnitPrice || "0")
        } else if (item.Type === "Service" || item.Type === "NonInventory") {
          preco = Number.parseFloat(item.UnitPrice || "0")
        }

        // Verificar se o produto já existe
        const existingProduct = await prisma.produto.findFirst({
          where: { quickbooksId: item.Id },
        })

        if (existingProduct) {
          // Atualizar produto existente
          await prisma.produto.update({
            where: { id: existingProduct.id },
            data: {
              ...itemData,
              preco: preco > 0 ? preco : existingProduct.preco, // Manter preço atual se não houver novo
            },
          })
          updated++
        } else {
          // Criar novo produto
          const newProduct = await prisma.produto.create({
            data: {
              ...itemData,
              preco,
              categoriaId: null, // Pode ser atualizado posteriormente
            },
          })
          created++
        }

        syncedProducts.push({
          id: item.Id,
          name: item.Name,
          type: item.Type,
        })

        // Log de sincronização bem-sucedida
        await prisma.syncLog.create({
          data: {
            entityType: "produto",
            entityId: existingProduct?.id || null,
            action: existingProduct ? "update" : "create",
            status: "success",
            quickbooksId: item.Id,
            details: `Produto ${item.Name} sincronizado`,
          },
        })
      } catch (itemError: any) {
        console.error(`Erro ao sincronizar produto ${item.Id}:`, itemError)

        // Log de erro
        await prisma.syncLog.create({
          data: {
            entityType: "produto",
            action: "sync",
            status: "error",
            quickbooksId: item.Id,
            errorMessage: itemError.message,
            details: `Falha ao sincronizar produto ${item.Name}`,
          },
        })
      }
    }

    console.log(`✅ Sincronização concluída: ${created} criados, ${updated} atualizados`)

    return NextResponse.json({
      success: true,
      message: "Produtos sincronizados com sucesso",
      synced: items.length,
      created,
      updated,
      products: syncedProducts,
    })
  } catch (error: any) {
    console.error("❌ Erro na sincronização de produtos:", error)

    // Log de erro geral
    try {
      await prisma.syncLog.create({
        data: {
          entityType: "produto",
          action: "sync",
          status: "error",
          errorMessage: error.message,
          details: "Falha geral na sincronização de produtos",
        },
      })
    } catch (logError) {
      console.error("Erro ao criar log:", logError)
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro ao sincronizar produtos",
        details: error.response?.data || null,
      },
      { status: 500 },
    )
  }
}
