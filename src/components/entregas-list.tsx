"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MapPin, Calendar, Clock, AlertCircle, Package, Truck } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { EntregaDetalhesDialog } from "@/components/entrega-detalhes-dialog"
import api from "@/lib/api"
import { Pedido } from "@/@types"

interface EntregasListProps {
  searchTerm: string
  clienteFilter: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  statusFilter: string[]
}

export function EntregasList({ searchTerm, clienteFilter, dateRange, statusFilter }: EntregasListProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchPedidos = async () => {
      setIsLoading(true)
      try {
        const response = await api.get("/pedido")
        // Filtrar apenas pedidos com status agendado ou em_andamento
        const filteredByStatus = response.data.filter((pedido: Pedido) => 
          statusFilter.includes(pedido.status)
        )
        setPedidos(filteredByStatus)
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPedidos()
  }, [statusFilter])

  // Aplicar filtros aos pedidos
  useEffect(() => {
    let filtered = [...pedidos]

    // Filtrar por cliente
    if (clienteFilter && clienteFilter !== "todos") {
      filtered = filtered.filter(pedido => pedido.cliente.id === Number(clienteFilter))
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(pedido => 
        pedido.cliente.nome.toLowerCase().includes(term) ||
        pedido.id.toString().includes(term)
      )
    }

    // Filtrar por intervalo de datas
    if (dateRange.from) {
      filtered = filtered.filter(pedido => {
        const pedidoDate = new Date(pedido.data)
        return pedidoDate >= dateRange.from!
      })
    }

    if (dateRange.to) {
      filtered = filtered.filter(pedido => {
        const pedidoDate = new Date(pedido.data)
        return pedidoDate <= dateRange.to!
      })
    }

    setFilteredPedidos(filtered)
  }, [pedidos, searchTerm, clienteFilter, dateRange])

  const handleOpenDetails = (pedido: Pedido) => {
    setSelectedPedido(pedido)
    setIsDialogOpen(true)
  }

  // Componente para exibir o status do pedido
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { label: string, variant: "outline" | "default" | "secondary" | "destructive" }> = {
      "agendado": { label: "Agendado", variant: "outline" },
      "em_andamento": { label: "Em Andamento", variant: "default" },
      "concluido": { label: "Concluído", variant: "secondary" },
      "cancelado": { label: "Cancelado", variant: "destructive" },
    }

    const config = statusConfig[status] || { label: status, variant: "outline" }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return <EntregasSkeleton />
  }

  if (filteredPedidos.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum pedido encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">Não há pedidos para os filtros selecionados.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {filteredPedidos.map((pedido) => (
          <div key={pedido.id} className="rounded-lg border p-4 shadow-sm transition-all hover:shadow">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Pedido #{pedido.id}</h3>
                  <StatusBadge status={pedido.status} />
                </div>
                <p className="text-sm text-muted-foreground">{pedido.cliente.nome}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{format(new Date(pedido.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{pedido.horario}</span>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm">{pedido.endereco}</p>
                <p className="text-xs text-muted-foreground">Local de Entrega/Retirada</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {pedido.itens.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center rounded-full bg-muted px-3 py-1 text-xs">
                  <Package className="mr-1 h-3 w-3" />
                  {item.produto.nome} x{item.quantidade}
                </div>
              ))}
              {pedido.itens.length > 3 && (
                <div className="rounded-full bg-muted px-3 py-1 text-xs">
                  +{pedido.itens.length - 3} itens
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={() => handleOpenDetails(pedido)}>
                <Truck className="mr-2 h-4 w-4" />
                {pedido.status === "concluido" ? "Ver Detalhes" : "Registrar Entrega/Retirada"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedPedido && (
        <EntregaDetalhesDialog
          pedido={selectedPedido}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  )
}

function EntregasSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-[180px]" />
                <Skeleton className="h-5 w-[80px]" />
              </div>
              <Skeleton className="mt-2 h-4 w-[100px]" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2">
            <Skeleton className="h-4 w-4" />
            <div>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="mt-1 h-3 w-[120px]" />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6 w-[100px] rounded-full" />
            <Skeleton className="h-6 w-[100px] rounded-full" />
            <Skeleton className="h-6 w-[100px] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
