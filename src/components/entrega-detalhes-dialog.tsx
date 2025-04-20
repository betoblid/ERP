"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2, MapPin, User, Clock, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import "react-day-picker/style.css";
import { cn } from "@/lib/utils"
import { usePedidos } from "@/hooks/use-pedidos"
import { Badge } from "@/components/ui/badge"
import type { Pedido } from "@/@types"
import { toast } from "sonner"
import api from "@/lib/api"
import { DayPicker } from "react-day-picker"

// Schema de validação
const formSchema = z.object({
  tipoOperacao: z.enum(["entrega", "retirada"], {
    required_error: "Selecione o tipo de operação",
  }),
  recebidoPor: z.string().min(3, {
    message: "Nome deve ter pelo menos 3 caracteres",
  }),
  localEntrega: z.string().min(5, {
    message: "Endereço deve ter pelo menos 5 caracteres",
  }),
  dataEntrega: z.date({
    required_error: "Selecione uma data",
  }),
  horarioEntrega: z.string().min(1, {
    message: "Informe um horário",
  }),
  observacao: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EntregaDetalhesDialogProps {
  pedido: Pedido
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EntregaDetalhesDialog({
  pedido,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: EntregaDetalhesDialogProps) {
  const [open, setOpen] = useState(false)
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined

  const { atualizarEntrega } = usePedidos()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoOperacao: "entrega",
      recebidoPor: "",
      localEntrega: pedido.endereco,
      dataEntrega: new Date(),
      horarioEntrega: format(new Date(), "HH:mm"),
      observacao: "",
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      setControlledOpen(newOpen)
    } else {
      setOpen(newOpen)
    }
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    const user = sessionStorage.getItem("user")
    if (!user) {
      toast("Usuário não encontrado. Faça login novamente.")
      setIsSubmitting(false)
      return
    }
    const parsedUser = JSON.parse(user)
  

    try {
      const novoStatus = values.tipoOperacao === "entrega" ? "entregue" : "retirado"
   

      await api.put(`/pedido/${pedido.id}/finalizar`, {
        pedidoid: pedido.id,
        tipo: values.tipoOperacao,
        data: values.dataEntrega,
        status: novoStatus,
        recebido: values.recebidoPor,
        local: values.localEntrega,
        horario: values.horarioEntrega,
        observacao: values.observacao,
        funcionarioId: parsedUser.id, 
      })

      toast(`O pedido foi marcado como ${novoStatus}.`)

      handleOpenChange(false)
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error)
      toast("Ocorreu um erro ao processar sua solicitação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
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
    <Dialog open={isControlled ? controlledOpen : open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registrar Entrega/Retirada</DialogTitle>
          <DialogDescription>Atualize o status do pedido para entregue ou retirado.</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Informações do pedido */}
          <div className="rounded-lg border p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h3 className="font-medium">Pedido #{pedido.id}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Status: {getStatusBadge(pedido.status)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">

                <span>{format(new Date(pedido.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                <span>{pedido.horario}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium">{pedido.cliente?.nome}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Endereço</p>
                  <p className="text-sm">{pedido.endereco}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Itens do pedido:</h4>
              <ul className="text-sm space-y-1">
                {pedido.itens.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {item.produto?.nome} x{item.quantidade}
                    </span>
                    <span className="text-muted-foreground">
                      R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formulário de entrega/retirada */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tipoOperacao"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Operação</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="entrega" id="entrega" />
                          <Label htmlFor="entrega">Entrega</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="retirada" id="retirada" />
                          <Label htmlFor="retirada">Retirada</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="recebidoPor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recebido por</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataEntrega"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DayPicker
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="horarioEntrega"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="localEntrega"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais sobre a entrega/retirada"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Registrar {form.watch("tipoOperacao") === "entrega" ? "Entrega" : "Retirada"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
