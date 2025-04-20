"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Plus } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Cliente, Funcionario } from "@/@types"
import api from "@/lib/api"

// Schema de validação
const formSchema = z.object({
  titulo: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  clienteId: z.string({
    required_error: "Por favor selecione um cliente.",
  }),
  funcionarioId: z.string({
    required_error: "Por favor selecione um funcionário responsável.",
  }),
  status: z.string({
    required_error: "Por favor selecione um status.",
  }),
  endereco: z.string().min(5, {
    message: "O endereço deve ter pelo menos 5 caracteres.",
  }),
  data_agendado: z.date({
    required_error: "Por favor selecione uma data.",
  }),
  horario: z.string().min(1, {
    message: "Por favor informe um horário.",
  }),
  descricao: z.string().optional(),
})

export function NovaOrdemServicoDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientes, setClientes] = useState<Cliente[] | []>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[] | []>([])


  useEffect(() => {
    const getClientsAndClerk = async () => {
      try {
        const cleck = await api.get("/funcionario")
        const clients = await api.get("/clientes")

        setFuncionarios(cleck.data)
        setClientes(clients.data)

      } catch (error) {
        console.error("Erro ao carregar ordens de serviço:", error)
      }
    }

    getClientsAndClerk()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      clienteId: "",
      funcionarioId: "",
      status: "aberta",
      endereco: "",
      horario: "09:00",
      descricao: "",
    },
  })

  function formatDateOnly(date: Date) {
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate() + 1)}`
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Simulando envio para API
      await api.post("/orderm/criar", {
        titulo: values.titulo,
        clienteId: values.clienteId,
        funcionarioId: values.funcionarioId,
        status: values.status,
        endereco: values.endereco,
        data_agendado: formatDateOnly(values.data_agendado),
        horario: values.horario,
        descricao: values.descricao,
      })
      console.log("Valores do formulário:", values)
      // Exibir mensagem de sucesso
      toast(`OS criada para ${clientes.find((c) => c.id === Number.parseInt(values.clienteId))?.nome}`)

      // Fechar o modal e resetar o formulário
      setOpen(false)
      form.reset()

      // Atualizar a lista de ordens de serviço
      router.refresh()
    } catch (error) {
      console.error("Erro ao criar ordem de serviço:", error)
      toast("Ocorreu um erro ao processar sua solicitação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem de Serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>Preencha os dados para criar uma nova ordem de serviço.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da ordem de serviço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                name="funcionarioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funcionário Responsável</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um funcionário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {funcionarios.map((funcionario) => (
                          <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                            {funcionario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        <SelectItem value="aberta">Aberta</SelectItem>
                        <SelectItem value="andamento">Em Andamento</SelectItem>
                        <SelectItem value="finalizada">Finalizada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_agendado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? formatDateOnly(field.value) : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <FormLabel>Local de Execução</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes adicionais sobre o serviço" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Ordem de Serviço"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
