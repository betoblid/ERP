"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"
import { toast } from "sonner"
import api from "@/lib/api"
import { Cliente, Produto } from "@/@types"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css";

// Schema de validação
const formSchema = z.object({
  clienteId: z.string({
    required_error: "Por favor selecione um cliente.",
  }),
  status: z.enum(["agendado", "em_andamento", "concluido", "cancelado"], {
    required_error: "Por favor selecione um status.",
  }),
  data: z.date({
    required_error: "Por favor selecione uma data.",
  }),
  horario: z.string().min(1, {
    message: "Por favor informe um horário.",
  }),
  endereco: z.string().min(5, {
    message: "O endereço deve ter pelo menos 5 caracteres.",
  }),
  observacao: z.string().optional(),
  itens: z.array(
    z.object({
      produtoId: z.string({
        required_error: "Por favor selecione um produto.",
      }),
      quantidade: z.number().min(1, {
        message: "A quantidade deve ser pelo menos 1.",
      }),
    })
  ).min(1, {
    message: "Adicione pelo menos um produto ao pedido.",
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function NovoPedidoPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[] | []>([])
  const [clientes, setClientes] = useState<Cliente[] |[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [produtosResponse, clientesResponse] = await Promise.all([
          api.get("/produto"),
          api.get("/clientes"),
        ])

        setProdutos(produtosResponse.data)
        setClientes(clientesResponse.data)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast.error("Erro ao carregar dados. Tente novamente.")
      }
    }

    fetchData()
    console.log("Dados carregados com sucesso.")
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "agendado",
      horario: "09:00",
      endereco: "",
      observacao: "",
      itens: [{ produtoId: "", quantidade: 1 }],
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      // Formatar os dados para a API
      const payload = {
        clienteId: values.clienteId,
        status: values.status,
        data: format(values.data, "yyyy-MM-dd"),
        horario: values.horario,
        endereco: values.endereco,
        observacao: values.observacao || "",
        itens: values.itens.map(item => ({
          id: item.produtoId,
          quantidade: item.quantidade,
          preco: produtos.find(p => p.id === Number(item.produtoId))?.preco || 0,
        }))
      }
      // Verificar se o cliente foi selecionado
      if (!payload.clienteId) {
        toast.error("Por favor selecione um cliente.")
        return
      }
      // Verificar se o status foi selecionado
      if (!payload.status) {
        toast.error("Por favor selecione um status.")
        return
      }
      // verificar se tem duplicidade de produtos
      const folterItemDuplicado = payload.itens.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      )
      if (folterItemDuplicado.length !== payload.itens.length) {
        toast.error("Não é permitido adicionar o mesmo produto mais de uma vez.")
        return
      }
      // Enviar para a API
      await api.post("/pedido", payload)

      toast( `Pedido para ${clientes.find(c => c.id === Number(values.clienteId))?.nome} foi registrado.`)

      // Redirecionar para a lista de pedidos
      router.push("/pedido")
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error)
      toast(error.response?.data?.message || "Ocorreu um erro ao processar sua solicitação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Adicionar novo item ao pedido
  const addItem = () => {
    const currentItems = form.getValues("itens") || []
    form.setValue("itens", [...currentItems, { produtoId: "", quantidade: 1 }])
  }

  // Remover item do pedido
  const removeItem = (index: number) => {
    const currentItems = form.getValues("itens")
    if (currentItems.length > 1) {
      form.setValue("itens", currentItems.filter((_, i) => i !== index))
    } else {
      toast( "O pedido deve ter pelo menos um item.")
    }
  }

  // Calcular o preço total do pedido
  const calcularTotal = () => {
    const itens = form.getValues("itens")
    return itens.reduce((total, item) => {
      const produto = produtos.find(p => p.id === Number(item.produtoId))
      return total + (produto?.preco || 0) * item.quantidade
    }, 0)
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Novo Pedido"
        description="Registre um novo pedido no sistema"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Dados do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Dados do Pedido</CardTitle>
                <CardDescription>Informações básicas do pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
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

                  <FormField
                    control={form.control}
                    name="horario"
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
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço completo" {...field} />
                      </FormControl>
                      <FormDescription>
                        Local de entrega ou retirada do pedido
                      </FormDescription>
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
                        <Input placeholder="Observações adicionais" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Itens do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
                <CardDescription>Produtos incluídos no pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.watch("itens")?.map((_, index) => (
                  <div key={index} className="grid grid-cols-[1fr,auto,auto] gap-2 items-end">
                    <FormField
                      control={form.control}
                      name={`itens.${index}.produtoId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produto {index + 1}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {produtos.map((produto) => (
                                <SelectItem key={produto.id} value={produto.id.toString()}>
                                  {produto.nome} - R$ {produto.preco.toFixed(2)}
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qtd.</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="mb-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addItem} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>

                <div className="mt-4 rounded-md bg-muted p-4">
                  <div className="text-sm font-medium">Total do Pedido</div>
                  <div className="mt-1 text-2xl font-bold">
                    R$ {calcularTotal().toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardFooter className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Pedido"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}
