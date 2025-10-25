"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PageHeader } from "@/components/page-header"
import { toast } from "sonner"

interface Customer {
  Id: string
  DisplayName: string
  CompanyName?: string
  PrimaryEmailAddr?: { Address: string }
  PrimaryPhone?: { FreeFormNumber: string }
  BillAddr?: {
    Line1?: string
    City?: string
    CountrySubDivisionCode?: string
  }
  Balance?: number
  Active: boolean
  MetaData?: {
    CreateTime: string
    LastUpdatedTime: string
  }
}

export default function ClientesPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/clientes")
      if (!response.ok) throw new Error("Erro ao buscar clientes")

      const data = await response.json()
      setClientes(data)
    } catch (error: any) {
      console.error("Erro ao carregar clientes:", error)
      toast.error("Erro ao carregar clientes", {
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      cliente.DisplayName?.toLowerCase().includes(searchLower) ||
      cliente.CompanyName?.toLowerCase().includes(searchLower) ||
      cliente.PrimaryEmailAddr?.Address?.toLowerCase().includes(searchLower)
    )
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes do QuickBooks"
        breadcrumbs={[{ label: "Clientes" }]}
        actions={
          <Button onClick={() => router.push("/clientes/cadastro")}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        }
      />

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[300px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-sm text-muted-foreground">Carregando clientes do QuickBooks...</p>
              </div>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum cliente encontrado com esse termo de busca" : "Nenhum cliente cadastrado"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.Id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(cliente.DisplayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{cliente.DisplayName}</div>
                          <div className="text-sm text-muted-foreground">ID: {cliente.Id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{cliente.CompanyName || "-"}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {cliente.PrimaryEmailAddr?.Address && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {cliente.PrimaryEmailAddr.Address}
                          </div>
                        )}
                        {cliente.PrimaryPhone?.FreeFormNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {cliente.PrimaryPhone.FreeFormNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cliente.BillAddr?.City || cliente.BillAddr?.Line1 ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {cliente.BillAddr.City}
                            {cliente.BillAddr.CountrySubDivisionCode && `, ${cliente.BillAddr.CountrySubDivisionCode}`}
                          </span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(cliente.Balance)}</TableCell>
                    <TableCell>
                      <Badge variant={cliente.Active ? "default" : "secondary"}>
                        {cliente.Active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/clientes/editar/${cliente.Id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
