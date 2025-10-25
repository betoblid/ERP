"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlusCircle, Pencil, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Item {
  Id: string
  Name: string
  Type: string
  QtyOnHand: number
  UnitPrice: number
  PurchaseCost: number
  Active: boolean
  Description?: string
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filteredProdutos, setFilteredProdutos] = useState<Item[]>([])

  useEffect(() => {
    fetchProdutos()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = produtos.filter((p) => p.Name.toLowerCase().includes(search.toLowerCase()))
      setFilteredProdutos(filtered)
    } else {
      setFilteredProdutos(produtos)
    }
  }, [search, produtos])

  const fetchProdutos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/produtos")

      if (!response.ok) {
        throw new Error("Erro ao buscar produtos")
      }

      const data = await response.json()
      setProdutos(data)
      setFilteredProdutos(data)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      toast.error("Erro ao buscar produtos do QuickBooks")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerenciar itens do inventário no QuickBooks</p>
        </div>
        <Link href="/produtos/cadastro">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>Dados sincronizados com o QuickBooks Online</CardDescription>
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredProdutos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {search ? "Nenhum produto encontrado com esse nome" : "Nenhum produto cadastrado"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Quantidade</th>
                    <th className="text-left p-3">Preço Venda</th>
                    <th className="text-left p-3">Custo Compra</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProdutos.map((produto) => (
                    <tr key={produto.Id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{produto.Name}</div>
                          {produto.Description && (
                            <div className="text-sm text-muted-foreground">{produto.Description}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{produto.QtyOnHand || 0}</td>
                      <td className="p-3">R$ {Number(produto.UnitPrice || 0).toFixed(2)}</td>
                      <td className="p-3">R$ {Number(produto.PurchaseCost || 0).toFixed(2)}</td>
                      <td className="p-3">
                        <Badge variant={produto.Active ? "default" : "secondary"}>
                          {produto.Active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Link href={`/produtos/editar/${produto.Id}`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
