"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus, FileText, Filter, Search, Loader2, Package, Calendar, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { PedidoDetalhesDialog } from "@/components/pedido-detalhes-dialog"
import { EntregaDetalhesDialog } from "@/components/entrega-detalhes-dialog"
import { usePedidos } from "@/hooks/use-pedidos"
import { usePedidosFiltrados, usePedidoStore  } from "@/hooks/use-pedido-store"
import type { Cliente, Pedido, Produto } from "@/@types"
import api from "@/lib/api"

export default function PedidosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoading } = usePedidos()
  const { filtros, setFiltros, limparFiltros } = usePedidoStore()
  const pedidosFiltrados = usePedidosFiltrados()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoadingDependencies, setIsLoadingDependencies] = useState(true)
  const [busca, setBusca] = useState("")
  const [activeTab, setActiveTab] = useState("todos")

  // Carregar clientes e produtos
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingDependencies(true)
      try {
        const [clientesRes, produtosRes] = await Promise.all([
          api.get("/clientes").then((res) => res.data),
          api.get("/produto").then((res) => res.data),
        ])

        setClientes(clientesRes)
        setProdutos(produtosRes)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoadingDependencies(false)
      }
    }
    
    fetchData()
  }, [])

  // Aplicar filtros quando a busca mudar
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros({ busca })
    }, 300)

    return () => clearTimeout(timer)
  }, [busca, setFiltros])

  // Filtrar por status baseado na tab ativa
  useEffect(() => {
    if (activeTab === "todos") {
      setFiltros({ status: "" })
    } else {
      setFiltros({ status: activeTab })
    }
  }, [activeTab, setFiltros])

  const handleClienteChange = (clienteId: string) => {
    setFiltros({ clienteId: clienteId ? Number(clienteId) : null })
  }

  const handleProdutoChange = (produtoId: string) => {
    setFiltros({ produtoId: produtoId ? Number(produtoId) : null })
  }

  const handleLimparFiltros = () => {
    limparFiltros()
    setBusca("")
    setActiveTab("todos")
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "outline" | "secondary" | "destructive" }
    > = {
      agendado: { label: "Agendado", variant: "outline" },
      em_andamento: { label: "Em Andamento", variant: "default" },
      concluido: { label: "Concluído", variant: "secondary" },
      cancelado: { label: "Cancelado", variant: "destructive" },
      entregue: { label: "Entregue", variant: "secondary" },
      retirado: { label: "Retirado", variant: "secondary" },
    }

    const config = statusConfig[status] || statusConfig.agendado

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Pedidos"
        description="Gerencie todos os pedidos do sistema"
        actions={
          <Button onClick={() => router.push("/pedido/cadastro")} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="agendado">Agendados</TabsTrigger>
              <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
              <TabsTrigger value="concluido">Concluídos</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pedidos..."
                  className="pl-8 w-[200px] md:w-[300px]"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => document.getElementById("filtros")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtros</span>
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div id="filtros" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente</label>
                    <Select onValueChange={handleClienteChange} value={filtros.clienteId?.toString() || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os clientes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os clientes</SelectItem>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id.toString()}>
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Produto</label>
                    <Select onValueChange={handleProdutoChange} value={filtros.produtoId?.toString() || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os produtos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os produtos</SelectItem>
                        {produtos.map((produto) => (
                          <SelectItem key={produto.id} value={produto.id.toString()}>
                            {produto.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={handleLimparFiltros}>
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de pedidos */}
          <div className="mt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Carregando pedidos...</p>
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum pedido encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Não há pedidos que correspondam aos filtros selecionados.
                </p>
                <Button className="mt-4" variant="outline" onClick={handleLimparFiltros}>
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidosFiltrados.map((pedido: Pedido) => (
                  <Card key={pedido.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Pedido #{pedido.id}</h3>
                            {getStatusBadge(pedido.status)}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(pedido.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                            <span>•</span>
                            <span>{pedido.horario}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <PedidoDetalhesDialog
                            pedido={pedido}
                            trigger={
                              <Button variant="outline" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                Detalhes
                              </Button>
                            }
                          />

                          {(pedido.status === "agendado" || pedido.status === "em_andamento") && (
                            <EntregaDetalhesDialog
                              pedido={pedido}
                              trigger={
                                <Button size="sm">
                                  <Package className="mr-2 h-4 w-4" />
                                  Entrega/Retirada
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </div>

                      <div className="border-t px-4 py-3 bg-muted/50">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{pedido.cliente?.nome}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground truncate">{pedido.endereco}</span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {pedido.itens.map((item, index) => (
                            <Badge key={index} variant="outline" className="bg-background">
                              {item.produto?.nome} x{item.quantidade}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
