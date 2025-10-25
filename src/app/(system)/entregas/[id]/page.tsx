"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowLeft, Loader2, Package, Truck, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Entrega } from "@/@types"

export default function EntregaDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [entrega, setEntrega] = useState<Entrega | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nomeRecebedor, setNomeRecebedor] = useState("")
  const [identidadeRecebedor, setIdentidadeRecebedor] = useState("")
  const [fotoComprovante, setFotoComprovante] = useState<string | null>(null)

  useEffect(() => {
    loadEntrega()
  }, [])

  async function loadEntrega() {
    try {
      setLoading(true)
      const response = await fetch(`/api/entregas/${params.id}`)
      if (!response.ok) throw new Error("Erro ao carregar entrega")

      const data = await response.json()
      setEntrega(data)
      setNomeRecebedor(data.nomeRecebedor || "")
      setIdentidadeRecebedor(data.identidadeRecebedor || "")
      setFotoComprovante(data.fotoComprovante || null)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFotoComprovante(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleStatusChange(newStatus: string) {
    if (!entrega) return

    try {
      setSaving(true)
      const response = await fetch(`/api/entregas/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Erro ao atualizar status")

      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso",
      })

      loadEntrega()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleFinalizarEntrega() {
    if (!nomeRecebedor || !identidadeRecebedor) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e identidade de quem recebeu",
        variant: "destructive",
      })
      return
    }

    if (!fotoComprovante) {
      toast({
        title: "Foto obrigatória",
        description: "Por favor, tire uma foto do comprovante de entrega",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/entregas/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "entregue",
          nomeRecebedor,
          identidadeRecebedor,
          fotoComprovante,
        }),
      })

      if (!response.ok) throw new Error("Erro ao finalizar entrega")

      toast({
        title: "Sucesso!",
        description: "Entrega finalizada com sucesso",
      })

      router.push("/entregas")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando detalhes da entrega...</p>
        </div>
      </div>
    )
  }

  if (!entrega) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Entrega não encontrada</div>
      </div>
    )
  }

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Entrega #{entrega.pedido.numero}</h1>
            <p className="text-muted-foreground">{entrega.pedido.cliente.nome}</p>
          </div>
        </div>
        {getStatusBadge(entrega.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Número do Pedido</Label>
              <p className="font-semibold">{entrega.pedido.numero}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Cliente</Label>
              <p className="font-semibold">{entrega.pedido.cliente.nome}</p>
              <p className="text-sm text-muted-foreground">{entrega.pedido.cliente.telefone}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Endereço de Entrega</Label>
              <p className="text-sm">{entrega.pedido.endereco}</p>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground mb-2">Itens do Pedido</Label>
              <div className="space-y-2">
                {entrega.pedido.itens.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.produto?.nome} x{item.quantidade}
                    </span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(item.quantidade * item.precoUnitario)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Informações da Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Data e Horário</Label>
              <p className="font-semibold">
                {format(new Date(entrega.dataEntrega), "dd/MM/yyyy", { locale: ptBR })} às {entrega.horarioEntrega}
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground">Veículo</Label>
              <p className="font-semibold">
                {getTipoVeiculoLabel(entrega.tipoVeiculo)} - {entrega.placaVeiculo}
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground">Motorista</Label>
              <p className="font-semibold">{entrega.nomeMotorista}</p>
              <p className="text-sm text-muted-foreground">RG/CNH: {entrega.identidadeMotorista}</p>
            </div>

            {entrega.observacoes && (
              <div>
                <Label className="text-muted-foreground">Observações</Label>
                <p className="text-sm">{entrega.observacoes}</p>
              </div>
            )}

            <Separator />

            {entrega.status !== "entregue" && entrega.status !== "cancelada" && (
              <div className="flex gap-2">
                {entrega.status === "agendada" && (
                  <Button onClick={() => handleStatusChange("em_rota")} className="flex-1" disabled={saving}>
                    Iniciar Rota
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {entrega.status === "em_rota" && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Finalizar Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeRecebedor">Nome de Quem Recebeu *</Label>
                  <Input
                    id="nomeRecebedor"
                    value={nomeRecebedor}
                    onChange={(e) => setNomeRecebedor(e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identidadeRecebedor">RG/CPF de Quem Recebeu *</Label>
                  <Input
                    id="identidadeRecebedor"
                    value={identidadeRecebedor}
                    onChange={(e) => setIdentidadeRecebedor(e.target.value)}
                    placeholder="Número do documento"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fotoComprovante">Foto do Comprovante *</Label>
                <Input
                  id="fotoComprovante"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                />
                {fotoComprovante && (
                  <div className="mt-4">
                    <img
                      src={fotoComprovante || "/placeholder.svg"}
                      alt="Comprovante de entrega"
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <Button onClick={handleFinalizarEntrega} className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar Entrega
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {entrega.status === "entregue" && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Entrega Finalizada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Recebido por</Label>
                  <p className="font-semibold">{entrega.nomeRecebedor}</p>
                  <p className="text-sm text-muted-foreground">Doc: {entrega.identidadeRecebedor}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Data de Recebimento</Label>
                  <p className="font-semibold">
                    {entrega.dataRecebimento &&
                      format(new Date(entrega.dataRecebimento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {entrega.fotoComprovante && (
                <div>
                  <Label className="text-muted-foreground mb-2">Comprovante de Entrega</Label>
                  <img
                    src={entrega.fotoComprovante || "/placeholder.svg"}
                    alt="Comprovante de entrega"
                    className="max-w-full h-auto rounded-lg border mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
