"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, FileText, Send, Download, Eye, Trash2 } from "lucide-react"
import type { EstimateListItem } from "@/@types/estimate"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

export default function OrcamentosPage() {
  const router = useRouter()
  const [estimates, setEstimates] = useState<EstimateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadEstimates()
  }, [statusFilter])

  async function loadEstimates() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/estimates?${params}`)
      if (!response.ok) throw new Error("Erro ao carregar orçamentos")

      const data = await response.json()
      setEstimates(data)
    } catch (error: any) {
      toast( error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, syncToken: string) {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return

    try {
      const response = await fetch(`/api/estimates/${id}?syncToken=${syncToken}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erro ao excluir orçamento")

      toast("Orçamento excluído com sucesso")

      loadEstimates()
    } catch (error: any) {
      toast( error.message)
    }
  }

  async function handleSendEmail(id: string) {
    try {
      const response = await fetch(`/api/estimates/${id}/send`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Erro ao enviar orçamento")

      toast("Orçamento enviado por email com sucesso")

      loadEstimates()
    } catch (error: any) {
      toast( error.message)
    }
  }

  async function handleDownloadPDF(id: string) {
    try {
      const response = await fetch(`/api/estimates/${id}/pdf`)
      if (!response.ok) throw new Error("Erro ao baixar PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `orcamento-${id}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      toast( error.message)
    }
  }

  const filteredEstimates = estimates.filter((estimate) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      estimate.CustomerRef.name.toLowerCase().includes(searchLower) ||
      estimate.DocNumber?.toLowerCase().includes(searchLower)
    )
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800",
      Accepted: "bg-green-100 text-green-800",
      Closed: "bg-gray-100 text-gray-800",
      Rejected: "bg-red-100 text-red-800",
    }
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie seus orçamentos do QuickBooks</p>
        </div>
        <Button onClick={() => router.push("/orcamentos/novo")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Pending">Pendente</SelectItem>
                <SelectItem value="Accepted">Aceito</SelectItem>
                <SelectItem value="Closed">Fechado</SelectItem>
                <SelectItem value="Rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredEstimates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum orçamento encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.map((estimate) => (
                  <TableRow key={estimate.Id}>
                    <TableCell className="font-medium">{estimate.DocNumber}</TableCell>
                    <TableCell>{estimate.CustomerRef.name}</TableCell>
                    <TableCell>{format(new Date(estimate.TxnDate), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "USD",
                      }).format(estimate.TotalAmt)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(estimate.TxnStatus)}`}
                      >
                        {estimate.TxnStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          estimate.EmailStatus === "EmailSent"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {estimate.EmailStatus === "EmailSent" ? "Enviado" : "Não enviado"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/orcamentos/${estimate.Id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/orcamentos/editar/${estimate.Id}`)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendEmail(estimate.Id)}>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar por Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(estimate.Id)}>
                            <Download className="mr-2 h-4 w-4" />
                            Baixar PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(estimate.Id, estimate.SyncToken || "0")}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
