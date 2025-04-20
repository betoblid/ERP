"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MapPin, User, Calendar, Clock, AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { OrdemServico } from "@/@types"
import api from "@/lib/api"

// Função para buscar ordens de serviço da API
async function fetchOrdensServico(params: URLSearchParams): Promise<OrdemServico[]> {

  const response = await api.get("/ordem/listar")

  console.log("Response:", response.data)
  // Aplicar filtros
  let filteredOS = [...response.data]

  // Filtrar por data
  const dataParam = params.get("data")
  if (dataParam) {
    const dataFiltro = new Date(dataParam)
    filteredOS = filteredOS.filter(
      (os) =>
        new Date(os.dataAgendado).getUTCDate() === dataFiltro.getUTCDate() &&
        new Date(os.dataAgendado).getUTCMonth() === dataFiltro.getUTCMonth() 
    )
  }

  // Filtrar por status
  const statusParam = params.get("status")
  if (statusParam) {
    filteredOS = filteredOS.filter((os) => os.status === statusParam)
  }

  // Filtrar por funcionário
  const funcionarioParam = params.get("funcionario")
  if (funcionarioParam) {
    filteredOS = filteredOS.filter((os) => os.funcionario.id === Number.parseInt(funcionarioParam))
  }

  // Filtrar por busca
  const buscaParam = params.get("busca")
  if (buscaParam) {
    const termoBusca = buscaParam
    filteredOS = filteredOS.filter(
      (os) =>
        os.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
        os.cliente.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        os.funcionario.nome.toLowerCase().includes(termoBusca.toLowerCase())
    )
  }

  return filteredOS
}

export function OrdemServicoList() {
  const searchParams = useSearchParams()
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOrdensServico = async () => {
      setIsLoading(true)
      try {
        const data = await fetchOrdensServico(searchParams)
        setOrdensServico(data)
      } catch (error) {
        console.error("Erro ao carregar ordens de serviço:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrdensServico()
  }, [searchParams])

  // Componente para exibir o status da OS
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      aberta: { label: "Aberta", variant: "outline" as const },
      andamento: { label: "Em Andamento", variant: "default" as const },
      finalizada: { label: "Finalizada", variant: "secondary" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aberta

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return <OrdensServicoSkeleton />
  }

  if (ordensServico.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhuma ordem de serviço encontrada</h3>
        <p className="mt-2 text-sm text-muted-foreground">Não há ordens de serviço para os filtros selecionados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {ordensServico.map((os) => (
        <div key={os.id} className="rounded-lg border p-4 shadow-sm transition-all hover:shadow">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{os.titulo}</h3>
                <StatusBadge status={os.status} />
              </div>
              <p className="text-sm text-muted-foreground">OS-0{os.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{`${new Date(os.dataAgendado).getUTCDate()}/${new Date(os.dataAgendado).getUTCMonth() + 1}/${new Date(os.dataAgendado).getUTCFullYear()}`}</span>
              <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{os.horarioExecucao}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{os.cliente.nome}</p>
                <p className="text-xs text-muted-foreground">Cliente</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{os.funcionario.nome}</p>
                <p className="text-xs text-muted-foreground">Técnico Responsável</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm">{os.localExecucao}</p>
              <p className="text-xs text-muted-foreground">Local de Execução</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function OrdensServicoSkeleton() {
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

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4" />
              <div>
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="mt-1 h-3 w-[80px]" />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4" />
              <div>
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="mt-1 h-3 w-[80px]" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2">
            <Skeleton className="h-4 w-4" />
            <div>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="mt-1 h-3 w-[120px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
