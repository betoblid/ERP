"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Estimate } from "@/@types/estimate"
import type { Motorista, Veiculo } from "@/@types"
import { toast } from "sonner"

const formSchema = z.object({
  dataEntrega: z.date({
    required_error: "Data de entrega é obrigatória",
  }),
  horarioEntrega: z.string().min(1, "Horário de entrega é obrigatório"),
  motoristaId: z.string().min(1, "Motorista é obrigatório"),
  veiculoId: z.string().min(1, "Veículo é obrigatório"),
  observacoes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ConversaoFaturaDialogProps {
  estimateId: string
  estimate: Estimate
  children: React.ReactNode
  onSuccess?: () => void
}

export function ConversaoFaturaDialog({ estimateId, estimate, children, onSuccess }: ConversaoFaturaDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataEntrega: addDays(new Date(), 1), // Dia seguinte como padrão
      horarioEntrega: format(new Date(), "HH:mm"),
      observacoes: "",
    },
  })

  useEffect(() => {
    if (open) {
      loadMotoristas()
      loadVeiculos()
    }
  }, [open])

  async function loadMotoristas() {
    try {
      setLoadingData(true)
      const response = await fetch("/api/motoristas?ativo=true")
      if (!response.ok) throw new Error("Erro ao carregar motoristas")
      const data = await response.json()
      setMotoristas(data)
    } catch (error: any) {
      toast( error.message)
    } finally {
      setLoadingData(false)
    }
  }

  async function loadVeiculos() {
    try {
      const response = await fetch("/api/veiculos?ativo=true")
      if (!response.ok) throw new Error("Erro ao carregar veículos")
      const data = await response.json()
      setVeiculos(data)
    } catch (error: any) {
      toast( error.message)
    }
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/estimates/${estimateId}/convert-to-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimateId,
          dataEntrega: format(values.dataEntrega, "yyyy-MM-dd"),
          horarioEntrega: values.horarioEntrega,
          motoristaId: values.motoristaId,
          veiculoId: values.veiculoId,
          observacoes: values.observacoes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao converter orçamento")
      }

      const result = await response.json()

      toast(`Orçamento convertido em fatura #${result.pedido.numero}`)

      setOpen(false)
      form.reset()

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/pedidos")
        router.refresh()
      }
    } catch (error: any) {
      toast( error.message)
    } finally {
      setIsSubmitting(false)
    }
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Converter Orçamento em Fatura</DialogTitle>
          <DialogDescription>
            Preencha as informações de entrega para converter o orçamento #{estimate.DocNumber} em fatura
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataEntrega"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Entrega *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < addDays(today, 1) // Bloqueia hoje e datas anteriores
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horarioEntrega"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Entrega *</FormLabel>
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
              name="motoristaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motorista *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loadingData}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o motorista"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {motoristas.map((motorista) => (
                        <SelectItem key={motorista.id} value={motorista.id.toString()}>
                          {motorista.nomeCompleto} - CNH: {motorista.numeroHabilitacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="veiculoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veículo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loadingData}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o veículo"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {veiculos.map((veiculo) => (
                        <SelectItem key={veiculo.id} value={veiculo.id.toString()}>
                          {getTipoVeiculoLabel(veiculo.tipoVeiculo)} - {veiculo.placa} ({veiculo.marca} {veiculo.modelo}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais sobre a entrega"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Convertendo...
                  </>
                ) : (
                  "Converter em Fatura"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
