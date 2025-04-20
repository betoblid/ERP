"use client"

import { useEffect, useState } from "react"
import { Search, Filter, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { EntregasList } from "@/components/entregas-list"
import { PageHeader } from "@/components/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api"

export default function EntregasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clienteFilter, setClienteFilter] = useState("todos")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
    const [clientes, setClientes] = useState<{ id: number; nome: string }[]>([])

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get("/clientes")
        setClientes(response.data)
      } catch (error) {
        console.error("Erro ao buscar clientes:", error)
      }
    }

    fetchClientes()

  }, [searchTerm])

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Entregas e Retiradas"
        description="Gerencie as entregas e retiradas de pedidos"
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine sua busca de entregas e retiradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou pedido"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={clienteFilter} onValueChange={setClienteFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filtrar por cliente" />
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

            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pendentes" className="mt-6">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>
        <TabsContent value="pendentes" className="mt-4">
          <EntregasList
            searchTerm={searchTerm}
            clienteFilter={clienteFilter}
            dateRange={dateRange}
            statusFilter={["agendado", "em_andamento"]}
          />
        </TabsContent>
        <TabsContent value="concluidas" className="mt-4">
          <EntregasList
            searchTerm={searchTerm}
            clienteFilter={clienteFilter}
            dateRange={dateRange}
            statusFilter={["concluido"]}
          />
        </TabsContent>
        <TabsContent value="todas" className="mt-4">
          <EntregasList
            searchTerm={searchTerm}
            clienteFilter={clienteFilter}
            dateRange={dateRange}
            statusFilter={["agendado", "em_andamento", "concluido", "cancelado"]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
