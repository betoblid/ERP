"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Veiculo {
  id: string
  placa: string
  renavam: string
  marca: string
  modelo: string
  anoFabricacao: number
  anoModelo: number
  cor: string
  tipoVeiculo: string
  categoriaFrota: string
  baseOperacao: string
  taraVeiculo: number
  capacidadeCarga: number
  capacidadeCargaM3: number
  capacidadeTanque: number
  seguradora: string | null
  vigenciaSeguro: string | null
  valorEntrega: number
  valorKmRodado: number
  valorDiaria: number
}

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchVeiculos()
  }, [])

  const fetchVeiculos = async () => {
    try {
      const response = await fetch("/api/veiculos")
      if (!response.ok) throw new Error("Erro ao buscar veículos")
      const data = await response.json()
      setVeiculos(data)
    } catch (error: any) {
      toast(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/veiculos/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erro ao excluir veículo")

      toast( "Veículo excluído com sucesso!")

      setVeiculos(veiculos.filter((v) => v.id !== deleteId))
      setDeleteId(null)
    } catch (error: any) {
      toast( error.message)
    } finally {
      setDeleting(false)
    }
  }

  const filteredVeiculos = veiculos.filter(
    (veiculo) =>
      veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Veículos</h1>
          <p className="text-muted-foreground">Gerencie a frota de veículos</p>
        </div>
        <Button asChild>
          <Link href="/veiculos/cadastro">
            <Plus className="mr-2 h-4 w-4" />
            Novo Veículo
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque por placa, marca ou modelo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar veículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVeiculos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhum veículo encontrado" : "Nenhum veículo cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVeiculos.map((veiculo) => (
                  <TableRow key={veiculo.id}>
                    <TableCell className="font-mono font-bold">{veiculo.placa}</TableCell>
                    <TableCell>
                      {veiculo.marca} {veiculo.modelo}
                    </TableCell>
                    <TableCell>
                      {veiculo.anoFabricacao}/{veiculo.anoModelo}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{veiculo.tipoVeiculo}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{veiculo.categoriaFrota}</Badge>
                    </TableCell>
                    <TableCell>
                      {veiculo.capacidadeCarga}kg / {veiculo.capacidadeCargaM3}m³
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/veiculos/editar/${veiculo.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(veiculo.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
