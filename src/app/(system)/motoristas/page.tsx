"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Loader2, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Motorista } from "@/@types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

export default function MotoristasPage() {
  const router = useRouter()
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadMotoristas()
  }, [])

  async function loadMotoristas() {
    try {
      setLoading(true)
      const response = await fetch("/api/motoristas")
      if (!response.ok) throw new Error("Erro ao carregar motoristas")

      const data = await response.json()
      setMotoristas(data)
    } catch (error: any) {
      toast(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este motorista?")) return

    try {
      const response = await fetch(`/api/motoristas/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erro ao excluir motorista")

      toast("Motorista excluído com sucesso")

      loadMotoristas()
    } catch (error: any) {
      toast( error.message)
    }
  }

  const filteredMotoristas = motoristas.filter(
    (motorista) =>
      motorista.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorista.cpf.includes(searchTerm) ||
      motorista.numeroHabilitacao.includes(searchTerm),
  )

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando motoristas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Motoristas</h1>
          <p className="text-muted-foreground">Gerenciar motoristas cadastrados</p>
        </div>
        <Button onClick={() => router.push("/motoristas/cadastro")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Motorista
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou CNH..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMotoristas.map((motorista) => (
          <Card key={motorista.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{motorista.nomeCompleto}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">CNH: {motorista.numeroHabilitacao}</p>
                </div>
                <Badge variant={motorista.ativo ? "default" : "secondary"}>
                  {motorista.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Categoria CNH:</span> {motorista.categoriaCnh}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Validade CNH:</span>{" "}
                {format(new Date(motorista.validadeCnh), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">CPF:</span> {motorista.cpf}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Celular:</span> {motorista.celular}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Cidade:</span> {motorista.cidade}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => router.push(`/motoristas/editar/${motorista.id}`)}
                >
                  <Edit className="mr-2 h-3 w-3" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(motorista.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMotoristas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum motorista encontrado</p>
        </div>
      )}
    </div>
  )
}
