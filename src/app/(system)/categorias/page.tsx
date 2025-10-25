"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlusCircle, Pencil, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Category {
  Id: string
  Name: string
  Type: string
  Level: number
  SubItem: boolean
  ParentRef?: {
    value: string
    name: string
  }
  Active: boolean
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filteredCategorias, setFilteredCategorias] = useState<Category[]>([])

  useEffect(() => {
    fetchCategorias()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = categorias.filter((c) => c.Name.toLowerCase().includes(search.toLowerCase()))
      setFilteredCategorias(filtered)
    } else {
      setFilteredCategorias(categorias)
    }
  }, [search, categorias])

  const fetchCategorias = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/categorias")

      if (!response.ok) {
        throw new Error("Erro ao buscar categorias")
      }

      const data = await response.json()
      setCategorias(data)
      setFilteredCategorias(data)
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
      toast.error("Erro ao buscar categorias do QuickBooks")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Gerenciar categorias de produtos no QuickBooks</p>
        </div>
        <Link href="/categorias/cadastro">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
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
          ) : filteredCategorias.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {search ? "Nenhuma categoria encontrada com esse nome" : "Nenhuma categoria cadastrada"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Nível</th>
                    <th className="text-left p-3">Categoria Pai</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategorias.map((categoria) => (
                    <tr key={categoria.Id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium">{categoria.Name}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">Nível {categoria.Level || 0}</Badge>
                      </td>
                      <td className="p-3">{categoria.ParentRef?.name || "-"}</td>
                      <td className="p-3">
                        <Badge variant={categoria.Active ? "default" : "secondary"}>
                          {categoria.Active ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Link href={`/categorias/editar/${categoria.Id}`}>
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
