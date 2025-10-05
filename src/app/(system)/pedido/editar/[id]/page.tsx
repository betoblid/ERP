"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Loader2, Plus, Trash2, Save, ArrowLeft, AlertTriangle, CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/page-header"
import { usePedidos } from "@/hooks/use-pedidos"
import type { Cliente, Produto, Pedido } from "@/@types"
import { toast } from "sonner"
import api from "@/lib/api"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"

const formSchema = z.object({
  clienteId: z.coerce
    .number({
      required_error: "Cliente é obrigatório",
      invalid_type_error: "Selecione um cliente válido",
    })
    .positive("Selecione um cliente válido"),
  status: z.enum(["agendado", "em_andamento", "concluido", "cancelado", "entregue", "retirado"], {
    required_error: "Status é obrigatório",
  }),
  data: z.date({
    required_error: "Data é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  horario: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Formato de horário inválido. Use HH:MM",
    })
    .min(1, {
      message: "Horário é obrigatório",
    }),
  endereco: z.string().min(5, {
    message: "Endereço deve ter pelo menos 5 caracteres",
  }),
  observacao: z.string().optional(),
  itens: z
    .array(
      z.object({
        id: z.string().optional(),
        produtoId: z.coerce
          .number({
            required_error: "Produto é obrigatório",
            invalid_type_error: "Selecione um produto válido",
          })
          .positive("Selecione um produto válido"),
        quantidade: z.coerce
          .number({
            required_error: "Quantidade é obrigatória",
            invalid_type_error: "Quantidade deve ser um número",
          })
          .positive({
            message: "Quantidade deve ser maior que zero",
          }),
        precoUnitario: z.coerce
          .number({
            required_error: "Preço é obrigatório",
            invalid_type_error: "Preço deve ser um número",
          })
          .positive({
            message: "Preço deve ser maior que zero",
          }),
      }),
    )
    .min(1, {
      message: "Adicione pelo menos um item ao pedido",
    }),
})

type FormValues = z.infer<typeof formSchema>

export default function EditarPedidoPage() {
  const router = useRouter()
  const params = useParams()
  const pedidoId = params.id as string

  const { getPedidoPorId, atualizarPedido } = usePedidos()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [pedido, setPedido] = useState<Pedido | undefined>(undefined)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clienteId: 0,
      status: "agendado",
      data: new Date(),
      horario: format(new Date(), "HH:mm"),
      endereco: "",
      observacao: "",
      itens: [],
    },
    mode: "onChange",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itens",
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setLoadingError(null)
      try {
        const [pedidoData, clientesRes, produtosRes] = await Promise.all([
          getPedidoPorId(pedidoId),
          api.get("/clientes").then((res) => res.data),
          api.get("/produtos").then((res) => res.data),
        ])

        setPedido(pedidoData)
        setClientes(clientesRes)
        setProdutos(produtosRes)

        const cliente = clientesRes.find((c: Cliente) => c.id === pedidoData.clienteId) || null
        setClienteSelecionado(cliente)

        form.reset({
          clienteId: pedidoData.clienteId,
          status: pedidoData.status,
          data: new Date(pedidoData.data),
          horario: pedidoData.horario,
          endereco: pedidoData.endereco,
          observacao: pedidoData.observacao || "",
          itens: pedidoData.itens.length
            ? pedidoData.itens.map((item: any) => ({
                id: item.id,
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario,
              }))
            : [],
        })
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setLoadingError(error instanceof Error ? error.message : "Não foi possível carregar os dados do pedido.")
        toast.error("Erro ao carregar dados do pedido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [pedidoId, getPedidoPorId, form])

  const handleClienteChange = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === Number(clienteId)) || null
    setClienteSelecionado(cliente)

    if (cliente) {
      form.setValue("endereco", cliente.endereco, { shouldValidate: true })
    }
  }

  const handleProdutoChange = (index: number, produtoId: string) => {
    const produto = produtos.find((p) => p.id === Number(produtoId))
    if (produto) {
      form.setValue(`itens.${index}.precoUnitario`, produto.preco, { shouldValidate: true })
    }
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      console.log("Enviando dados:", values)

      const dadosAtualizacao = {
        status: values.status,
        data: values.data.toISOString(),
        horario: values.horario,
        endereco: values.endereco,
        clienteId: values.clienteId,
        observacao: values.observacao || "",
        itens: values.itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        })),
      }

      console.log("Dados formatados para envio:", dadosAtualizacao)

      await atualizarPedido(pedidoId, dadosAtualizacao)

      toast.success(`Pedido #${pedido?.numero || pedidoId} atualizado com sucesso!`)

      router.push("/pedidos")
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar pedido. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const calcularTotal = () => {
    const itens = form.watch("itens")
    return itens.reduce((total, item) => {
      return total + (item.quantidade || 0) * (item.precoUnitario || 0)
    }, 0)
  }

  const getProdutoById = (id: number) => {
    return produtos.find((p) => p.id === id)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando dados do pedido...</p>
        </div>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>{loadingError}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/pedidos")}>Voltar para Pedidos</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title={`Editar Pedido #${pedido?.numero || pedidoId}`}
        description="Atualize as informações do pedido"
        breadcrumbs={[
          { label: "Pedidos", href: "/pedidos" },
          { label: `Editar Pedido #${pedido?.numero || pedidoId}` },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.push("/pedidos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Pedido</CardTitle>
                <CardDescription>Dados básicos do pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(Number(value))
                          handleClienteChange(value)
                        }}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id.toString()}>
                              {cliente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {clienteSelecionado && (
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <div className="font-medium">{clienteSelecionado.nome}</div>
                    <div className="text-muted-foreground mt-1 space-y-1">
                      <div>{clienteSelecionado.email}</div>
                      <div>{clienteSelecionado.telefone}</div>
                      <div>
                        {clienteSelecionado.tipoDocumento === "cpf" ? "CPF" : "CNPJ"}: {clienteSelecionado.documento}
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="entregue">Entregue</SelectItem>
                          <SelectItem value="retirado">Retirado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="data"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
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
                              disabled={(date) => date < new Date("2024-01-01")}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário *</FormLabel>
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
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço *</FormLabel>
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
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais sobre o pedido"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Itens do Pedido</CardTitle>
                  <CardDescription>Produtos incluídos neste pedido</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ produtoId: 0, quantidade: 1, precoUnitario: 0 })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum item adicionado. Clique em "Adicionar" para começar.
                  </div>
                ) : (
                  <>
                    {fields.map((field, index) => {
                      const produtoId = form.watch(`itens.${index}.produtoId`)
                      const quantidade = form.watch(`itens.${index}.quantidade`) || 0
                      const precoUnitario = form.watch(`itens.${index}.precoUnitario`) || 0
                      const subtotal = quantidade * precoUnitario
                      const produto = produtoId ? getProdutoById(Number(produtoId)) : null

                      return (
                        <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                          <div className="grid grid-cols-12 gap-3">
                            <FormField
                              control={form.control}
                              name={`itens.${index}.produtoId`}
                              render={({ field: produtoField }) => (
                                <FormItem className="col-span-12 sm:col-span-6">
                                  <FormLabel>Produto *</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      produtoField.onChange(Number(value))
                                      handleProdutoChange(index, value)
                                    }}
                                    value={produtoField.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {produtos.map((produto) => (
                                        <SelectItem key={produto.id} value={produto.id.toString()}>
                                          {produto.nome}
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
                              name={`itens.${index}.quantidade`}
                              render={({ field: quantidadeField }) => (
                                <FormItem className="col-span-6 sm:col-span-3">
                                  <FormLabel>Qtd *</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...quantidadeField} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`itens.${index}.precoUnitario`}
                              render={({ field: precoField }) => (
                                <FormItem className="col-span-6 sm:col-span-3">
                                  <FormLabel>Preço *</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" min="0" {...precoField} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            {produto && (
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {produto.categoria?.nome || "Sem categoria"}
                                </Badge>
                                <span>Estoque: {produto.estoque || 0}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium">Subtotal: R$ {subtotal.toFixed(2)}</div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    <Separator />

                    <div className="flex justify-end">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total do Pedido</div>
                        <div className="text-2xl font-bold">R$ {calcularTotal().toFixed(2)}</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardFooter className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/pedidos")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}
