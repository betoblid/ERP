"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FieldValues, Resolver, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"

// Zod schema for form validation
const formSchema = z.object({
  DisplayName: z.string().min(1, "Nome de exibição é obrigatório"),
  CompanyName: z.string().optional(),
  PrintOnCheckName: z.string().optional(),
  GivenName: z.string().optional(),
  MiddleName: z.string().optional(),
  FamilyName: z.string().optional(),
  Title: z.string().optional(),
  Suffix: z.string().optional(),
  PrimaryEmailAddr: z
    .object({
      Address: z.string().email("Email inválido").optional(),
    })
    .optional(),
  PrimaryPhone: z
    .object({
      FreeFormNumber: z.string().optional(),
    })
    .optional(),
  AlternatePhone: z
    .object({
      FreeFormNumber: z.string().optional(),
    })
    .optional(),
  Mobile: z
    .object({
      FreeFormNumber: z.string().optional(),
    })
    .optional(),
  Fax: z
    .object({
      FreeFormNumber: z.string().optional(),
    })
    .optional(),
  WebAddr: z
    .object({
      URI: z.string().url("URL inválida").optional(),
    })
    .optional(),
  BillAddr: z
    .object({
      Line1: z.string().optional(),
      City: z.string().optional(),
      PostalCode: z.string().optional(),
      CountrySubDivisionCode: z.string().optional(),
      Country: z.string().optional(),
      Lat: z.string().optional(),
      Long: z.string().optional(),
    })
    .optional(),
  ShipAddr: z
    .object({
      Line1: z.string().optional(),
      City: z.string().optional(),
      PostalCode: z.string().optional(),
      CountrySubDivisionCode: z.string().optional(),
      Country: z.string().optional(),
    })
    .optional(),
  ResaleNum: z.string().optional(),
  SecondaryTaxIdentifier: z.string().optional(),
  GSTIN: z.string().optional(),
  GSTRegistrationType: z.string().optional(),
  TaxExemptionReasonId: z.string().optional(),
  PreferredDeliveryMethod: z.string().optional(),
  Taxable: z.boolean().default(false),
  Active: z.boolean().default(true),
  Job: z.boolean().default(false),
  BillWithParent: z.boolean().default(false),
  Notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CadastroClientePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

 const form = useForm<FormValues>({
  resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
  defaultValues: {
    DisplayName: "",
    Active: true,
    Taxable: false,
    Job: false,
    BillWithParent: false,
    PreferredDeliveryMethod: "None",
    BillAddr: {
      Country: "USA",
    },
    ShipAddr: {
      Country: "USA",
    },
  },
})

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar cliente")
      }

      const data = await response.json()

      toast.success("Cliente criado com sucesso!", {
        description: `${values.DisplayName} foi adicionado ao QuickBooks`,
      })

      router.push("/clientes")
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error)
      toast.error("Erro ao criar cliente", {
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Novo Cliente"
        description="Cadastre um novo cliente no QuickBooks"
        breadcrumbs={[{ label: "Clientes", href: "/clientes" }, { label: "Novo Cliente" }]}
        actions={
          <Button variant="outline" onClick={() => router.push("/clientes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="address">Endereços</TabsTrigger>
              <TabsTrigger value="tax">Fiscal</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>Dados principais do cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="DisplayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de Exibição *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João Silva" {...field} />
                        </FormControl>
                        <FormDescription>Nome que aparecerá nos relatórios e documentos</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="CompanyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Silva & Cia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="PrintOnCheckName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome para Impressão</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome no cheque" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="Title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Sr., Sra., Dr." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="Suffix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sufixo</FormLabel>
                          <FormControl>
                            <Input placeholder="Jr., Sr., III" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="GivenName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primeiro Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="João" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="MiddleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Meio</FormLabel>
                          <FormControl>
                            <Input placeholder="Carlos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="FamilyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome</FormLabel>
                          <FormControl>
                            <Input placeholder="Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="Active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Cliente Ativo</FormLabel>
                            <FormDescription>Cliente pode fazer negócios</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="Job"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>É um Job/Projeto</FormLabel>
                            <FormDescription>Marque se este cliente representa um projeto específico</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="BillWithParent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Faturar com Cliente Pai</FormLabel>
                            <FormDescription>Cobranças serão enviadas ao cliente pai</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="Notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Informações adicionais sobre o cliente"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                  <CardDescription>Telefones, email e website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="PrimaryEmailAddr.Address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Principal</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="cliente@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="PrimaryPhone.FreeFormNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone Principal</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="AlternatePhone.FreeFormNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone Alternativo</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 98888-8888" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Mobile.FreeFormNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Celular</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 97777-7777" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Fax.FreeFormNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fax</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 3333-3333" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="WebAddr.URI"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://www.exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="PreferredDeliveryMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Entrega Preferido</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="None">Nenhum</SelectItem>
                            <SelectItem value="Print">Impresso</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Endereço de Cobrança</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="BillAddr.Line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="BillAddr.City"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="São Paulo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="BillAddr.CountrySubDivisionCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="BillAddr.PostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="BillAddr.Country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input placeholder="Brasil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="BillAddr.Lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input placeholder="-23.5505" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="BillAddr.Long"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input placeholder="-46.6333" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ShipAddr.Line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ShipAddr.City"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="São Paulo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ShipAddr.CountrySubDivisionCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ShipAddr.PostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ShipAddr.Country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input placeholder="Brasil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tax" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Fiscais</CardTitle>
                  <CardDescription>Dados tributários e fiscais do cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="Taxable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Tributável</FormLabel>
                          <FormDescription>Aplicar impostos nas transações</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ResaleNum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Revenda</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de licença" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="SecondaryTaxIdentifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identificador Fiscal Secundário</FormLabel>
                        <FormControl>
                          <Input placeholder="CPF/CNPJ secundário" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="TaxExemptionReasonId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo de Isenção Fiscal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um motivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Governo Federal</SelectItem>
                            <SelectItem value="2">Governo Estadual</SelectItem>
                            <SelectItem value="3">Governo Local</SelectItem>
                            <SelectItem value="4">Governo Tribal</SelectItem>
                            <SelectItem value="5">Organização Beneficente</SelectItem>
                            <SelectItem value="6">Organização Religiosa</SelectItem>
                            <SelectItem value="7">Organização Educacional</SelectItem>
                            <SelectItem value="8">Hospital</SelectItem>
                            <SelectItem value="9">Revenda</SelectItem>
                            <SelectItem value="10">Permissão de Pagamento Direto</SelectItem>
                            <SelectItem value="11">Múltiplos Pontos de Uso</SelectItem>
                            <SelectItem value="12">Correspondência Direta</SelectItem>
                            <SelectItem value="13">Produção Agrícola</SelectItem>
                            <SelectItem value="14">Produção Industrial/Manufatura</SelectItem>
                            <SelectItem value="15">Diplomata Estrangeiro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">GST (Índia)</h3>

                    <FormField
                      control={form.control}
                      name="GSTIN"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GSTIN</FormLabel>
                          <FormControl>
                            <Input placeholder="Número GST" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="GSTRegistrationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Registro GST</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GST_REG_REG">GST Registrado Regular</SelectItem>
                              <SelectItem value="GST_REG_COMP">GST Registrado Composto</SelectItem>
                              <SelectItem value="GST_UNREG">GST Não Registrado</SelectItem>
                              <SelectItem value="CONSUMER">Consumidor</SelectItem>
                              <SelectItem value="OVERSEAS">Exterior</SelectItem>
                              <SelectItem value="SEZ">SEZ</SelectItem>
                              <SelectItem value="DEEMED">Considerado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
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
                  Salvar Cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
