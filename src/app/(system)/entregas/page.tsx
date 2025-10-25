"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Package, Truck, User, CheckCircle, Loader2, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import type { Entrega } from "@/types"

export default function EntregasPage() {
  const router = useRouter()
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("todas")
  const [busca, setBusca] = useState("")

  useEffect(() => {
    loadEntregas()
  }, [statusFilter])

  async function loadEntregas() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "todas") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/entregas?${params.toString()}`)
      if (!response.ok) throw new Error("Erro ao carregar entregas")

      const data = await response.json()
      setEntregas(data)
    } catch (error) {
      console.error("Error loading entregas:", error)
    } finally {
      setLoading(false)
    }
  }

  const entregasFiltradas = entregas.filter((entrega) => {
    const searchTerm = busca.toLowerCase()
    return (
      entrega.pedido.numero.toLowerCase().includes(searchTerm) ||
      entrega.pedido.cliente.nome.toLowerCase().includes(searchTerm) ||
      entrega.nomeMotorista.toLowerCase().includes(searchTerm) ||
      entrega.placaVeiculo.toLowerCase().includes(searchTerm)
    )
  })

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      agendada: { label: "Agendada", variant: "outline" },
      em_rota: { label: "Em Rota", variant: "default" },
      entregue: { label: "Entregue", variant: "secondary" },
      cancelada: { label: "Cancelada", variant: "destructive" },
    }

    const item = config[status] || config.agendada
    return <Badge variant={item.variant}>{item.label}</Badge>
  }

  const getTipoVeiculoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      moto: "Moto",
      fiorino: "Fiorino",
      vuc: "VUC",
      van: "Van",
      hr: "HR",
      "1/4": "1/4",
      iveco: "Iveco",
      toco: "Toco",
      truck: "Truck",
    }
    return labels[tipo] || tipo
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader title="Gestão de Entregas" description="Controle e acompanhamento de todas as entregas agendadas" />

      <Tabs defaultValue="todas" value={statusFilter} onValueChange={setStatusFilter} className="mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="agendada">Agendadas</TabsTrigger>
            <TabsTrigger value="em_rota">Em Rota</TabsTrigger>
            <TabsTrigger value="entregue">Entregues</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por pedido, cliente, motorista..."
              className="pl-8 w-full md:w-[300px]"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Carregando entregas...</p>
            </div>
          ) : entregasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma entrega encontrada</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Não há entregas que correspondam aos filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {entregasFiltradas.map((entrega) => (
                <Card
                  key={entrega.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => router.push(`/entregas/${entrega.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">Pedido #{entrega.pedido.numero}</CardTitle>
                        <CardDescription>{entrega.pedido.cliente.nome}</CardDescription>
                      </div>
                      {getStatusBadge(entrega.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(entrega.dataEntrega), "dd/MM/yyyy", { locale: ptBR })} às{" "}
                        {entrega.horarioEntrega}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {getTipoVeiculoLabel(entrega.tipoVeiculo)} - {entrega.placaVeiculo}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{entrega.nomeMotorista}</span>
                    </div>

                    {entrega.status === "entregue" && entrega.dataRecebimento && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Entregue em {format(new Date(entrega.dataRecebimento), "dd/MM/yyyy HH:mm")}</span>
                      </div>
                    )}

                    {entrega.observacoes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{entrega.observacoes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}
