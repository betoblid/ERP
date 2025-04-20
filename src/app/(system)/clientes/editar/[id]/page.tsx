"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import api from "@/lib/api"
import type { Cliente } from "@/@types"
import { toast } from "sonner"

// Schema de validação
const formSchema = z.object({
  nome: z.string().min(3, {
    message: "Nome deve ter pelo menos 3 caracteres",
  }),
  email: z.string().email({
    message: "Email inválido",
  }),
  telefone: z.string().min(10, {
    message: "Telefone deve ter pelo menos 10 dígitos",
  }),
  tipoDocumento: z.enum(["cpf", "cnpj"]),
  documento: z.string().min(11, {
    message: "Documento deve ter pelo menos 11 caracteres",
  }),
  endereco: z.string().min(5, {
    message: "Endereço deve ter pelo menos 5 caracteres",
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const clienteId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [cliente, setCliente] = useState<Cliente | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      tipoDocumento: "cpf",
      documento: "",
      endereco: "",
    },
  })

  // Carregar dados do cliente
  useEffect(() => {
    const fetchCliente = async () => {
      setIsLoading(true)
      try {
        const response = await api.get(`/cliente/${clienteId}`)
        const clienteData = response.data

        setCliente(clienteData)

        // Preencher o formulário com os dados do cliente
        form.reset({
          nome: clienteData.nome,
          email: clienteData.email,
          telefone: clienteData.telefone,
          tipoDocumento: clienteData.tipoDocumento,
          documento: clienteData.documento,
          endereco: clienteData.endereco,
        })
      } catch (error) {
        console.error("Erro ao carregar cliente:", error)
        toast("Não foi possível carregar os dados do cliente.")
        router.push("/clientes")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCliente()
  }, [clienteId, form, router])

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      await api.put(`/clientes/${clienteId}`, values)

      toast( `Os dados de ${values.nome} foram atualizados.`)
      
      router.push("/clientes")
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error)
      toast( "Ocorreu um erro ao processar sua solicitação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando dados do cliente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title={`Editar Cliente: ${cliente?.nome}`}
        description="Atualize as informações do cliente"
        breadcrumbs={[{ label: "Clientes", href: "/clientes" }, { label: `Editar Cliente` }]}
        actions={
          <Button variant="outline" onClick={() => router.push("/clientes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="tipoDocumento"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cpf">CPF</SelectItem>
                            <SelectItem value="cnpj">CNPJ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="documento"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Documento</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/clientes")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
