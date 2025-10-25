"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Download, Edit, Trash2, FileText, Loader2 } from "lucide-react"
import type { Estimate } from "@/@types/estimate"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ConversaoFaturaDialog } from "@/components/conversao-fatura-dialog"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function VisualizarOrcamentoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    loadEstimate()
  }, [])

  async function loadEstimate() {
    try {
      setLoading(true)
      const response = await fetch(`/api/estimates/${params.id}`)
      if (!response.ok) throw new Error("Erro ao carregar orçamento")

      const data = await response.json()
      setEstimate(data)
    } catch (error: any) {
      toast(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!estimate) return

    try {
      setUpdatingStatus(true)
      const response = await fetch(`/api/estimates/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          syncToken: estimate.SyncToken,
        }),
      })

      if (!response.ok) throw new Error("Erro ao atualizar status")

      toast( "Status atualizado com sucesso")

      loadEstimate()
    } catch (error: any) {
      toast( error.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleSendEmail() {
    try {
      const response = await fetch(`/api/estimates/${params.id}/send`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Erro ao enviar orçamento")

      toast( "Orçamento enviado por email com sucesso")

      loadEstimate()
    } catch (error: any) {
      toast( error.message)
    }
  }

  async function handleDownloadPDF() {
    try {
      const response = await fetch(`/api/estimates/${params.id}/pdf`)
      if (!response.ok) throw new Error("Erro ao baixar PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `orcamento-${estimate?.DocNumber}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      toast( error.message)
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return

    try {
      const response = await fetch(`/api/estimates/${params.id}?syncToken=${estimate?.SyncToken}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erro ao excluir orçamento")

      toast("Orçamento excluído com sucesso")

      router.push("/orcamentos")
    } catch (error: any) {
      toast( error.message)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando orçamento...</p>
        </div>
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Orçamento não encontrado</div>
      </div>
    )
  }

  const productLines = estimate.Line.filter((line) => line.DetailType === "SalesItemLineDetail")
  const subtotalLine = estimate.Line.find((line) => line.DetailType === "SubTotalLineDetail")
  const discountLine = estimate.Line.find((line) => line.DetailType === "DiscountLineDetail")

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Pending: "Pendente",
      Accepted: "Aceito",
      Closed: "Fechado",
      Rejected: "Recusado",
    }
    return labels[status] || status
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Pending: "outline",
      Accepted: "default",
      Closed: "secondary",
      Rejected: "destructive",
    }
    return variants[status] || "outline"
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Orçamento #{estimate.DocNumber}</h1>
            <p className="text-muted-foreground">
              Criado em {format(new Date(estimate.TxnDate), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSendEmail}>
            <Send className="mr-2 h-4 w-4" />
            Enviar Email
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
          <Button variant="outline" onClick={() => router.push(`/orcamentos/editar/${params.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <ConversaoFaturaDialog estimateId={params.id} estimate={estimate} onSuccess={() => router.push("/pedidos")}>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Converter em Fatura
            </Button>
          </ConversaoFaturaDialog>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Informações do Cliente</CardTitle>
              </div>
              <div className="flex gap-2 items-center">
                <Select value={estimate.TxnStatus} onValueChange={handleStatusChange} disabled={updatingStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pendente</SelectItem>
                    <SelectItem value="Accepted">Aceito</SelectItem>
                    <SelectItem value="Closed">Fechado</SelectItem>
                    <SelectItem value="Rejected">Recusado</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={estimate.EmailStatus === "EmailSent" ? "default" : "outline"}>
                  {estimate.EmailStatus === "EmailSent" ? "Email Enviado" : "Não Enviado"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Cliente</h3>
                <p>{estimate.CustomerRef.name}</p>
                {estimate.BillEmail && <p className="text-sm text-muted-foreground">{estimate.BillEmail.Address}</p>}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Endereço de Cobrança</h3>
                {estimate.BillAddr && (
                  <div className="text-sm">
                    {estimate.BillAddr.Line1 && <p>{estimate.BillAddr.Line1}</p>}
                    {estimate.BillAddr.Line2 && <p>{estimate.BillAddr.Line2}</p>}
                    {estimate.BillAddr.City && (
                      <p>
                        {estimate.BillAddr.City}, {estimate.BillAddr.CountrySubDivisionCode}{" "}
                        {estimate.BillAddr.PostalCode}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Data Estimada</h3>
                <p className="text-sm">{format(new Date(estimate.TxnDate), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              {estimate.ExpirationDate && (
                <div>
                  <h3 className="font-semibold mb-1">Data de Validade</h3>
                  <p className="text-sm">{format(new Date(estimate.ExpirationDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              )}
              {estimate.AcceptedDate && (
                <div>
                  <h3 className="font-semibold mb-1">Data de Aceite</h3>
                  <p className="text-sm">{format(new Date(estimate.AcceptedDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens do Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productLines.map((line, index) => (
                <div key={index} className="flex justify-between items-start p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{line.SalesItemLineDetail?.ItemRef.name}</h4>
                    {line.Description && <p className="text-sm text-muted-foreground">{line.Description}</p>}
                    <div className="flex gap-4 mt-2 text-sm">
                      <span>Qty: {line.SalesItemLineDetail?.Qty}</span>
                      <span>
                        Preço:{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "USD",
                        }).format(line.SalesItemLineDetail?.UnitPrice || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "USD",
                      }).format(line.Amount)}
                    </p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "USD",
                    }).format(subtotalLine?.Amount || 0)}
                  </span>
                </div>

                {discountLine && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Desconto ({discountLine.DiscountLineDetail?.DiscountPercent}%)
                    </span>
                    <span className="font-semibold text-destructive">
                      -
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "USD",
                      }).format(discountLine.Amount)}
                    </span>
                  </div>
                )}

                {estimate.TxnTaxDetail.TotalTax > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Imposto sobre vendas</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "USD",
                      }).format(estimate.TxnTaxDetail.TotalTax)}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "USD",
                    }).format(estimate.TotalAmt)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {(estimate.CustomerMemo || estimate.PrivateNote) && (
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {estimate.CustomerMemo && (
                <div>
                  <h3 className="font-semibold mb-2">Nota ao Cliente</h3>
                  <p className="text-sm text-muted-foreground">{estimate.CustomerMemo.value}</p>
                </div>
              )}
              {estimate.PrivateNote && (
                <div>
                  <h3 className="font-semibold mb-2">Memorando (Privado)</h3>
                  <p className="text-sm text-muted-foreground">{estimate.PrivateNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
