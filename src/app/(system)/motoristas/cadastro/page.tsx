"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const formSchema = z.object({
  primeiroNome: z.string().min(2, "Primeiro nome é obrigatório"),
  nomeCompleto: z.string().min(3, "Nome completo é obrigatório"),
  celular: z.string().min(10, "Celular é obrigatório"),
  operadora: z.string().optional(),
  cpf: z.string().min(11, "CPF é obrigatório"),
  email: z.string().email("Email inválido"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  rg: z.string().min(5, "RG é obrigatório"),
  orgaoEmissor: z.string().min(2, "Órgão emissor é obrigatório"),
  ufEmissor: z.string().length(2, "UF deve ter 2 caracteres"),
  municipioNasc: z.string().min(2, "Município de nascimento é obrigatório"),
  dataEmissaoRg: z.string().min(1, "Data de emissão do RG é obrigatória"),
  telefone: z.string().optional(),
  nomeMae: z.string().min(3, "Nome da mãe é obrigatório"),
  nomePai: z.string().min(3, "Nome do pai é obrigatório"),
  pis: z.string().optional(),
  pais: z.string().default("BRASIL"),
  sexo: z.enum(["masculino", "feminino", "outro"]),
  cep: z.string().min(8, "CEP é obrigatório"),
  endereco: z.string().min(3, "Endereço é obrigatório"),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  resideDesdeMes: z.number().min(1).max(12),
  resideDesdeAno: z.number().min(1900),
  numeroHabilitacao: z.string().min(5, "Número da habilitação é obrigatório"),
  cidadeCnh: z.string().min(2, "Cidade da CNH é obrigatória"),
  categoriaCnh: z.string().min(1, "Categoria da CNH é obrigatória"),
  dataEmissaoCnh: z.string().min(1, "Data de emissão da CNH é obrigatória"),
  validadeCnh: z.string().min(1, "Validade da CNH é obrigatória"),
  dataPrimeiraCnh: z.string().min(1, "Data da primeira CNH é obrigatória"),
  codSegurancaCnh: z.string().min(5, "Código de segurança da CNH é obrigatório"),
  anexoCnh: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const ufs = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

export default function CadastroMotoristaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pais: "BRASIL",
      resideDesdeMes: new Date().getMonth() + 1,
      resideDesdeAno: new Date().getFullYear(),
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/motoristas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao cadastrar motorista")
      }

      toast("Motorista cadastrado com sucesso")

      router.push("/motoristas")
      router.refresh()
    } catch (error: any) {
      toast( error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast( "Por favor, selecione uma imagem")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      form.setValue("anexoCnh", reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Cadastrar Motorista</h1>
          <p className="text-muted-foreground">Preencha os dados do motorista</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Principais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primeiroNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primeiro Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="João" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nomeCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva Santos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular *</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operadora"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operadora</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a operadora" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vivo">Vivo</SelectItem>
                          <SelectItem value="claro">Claro</SelectItem>
                          <SelectItem value="tim">TIM</SelectItem>
                          <SelectItem value="oi">Oi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos / Registros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
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
                      <FormLabel>E-mail *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Nascimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG *</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orgaoEmissor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Órgão Emissor *</FormLabel>
                      <FormControl>
                        <Input placeholder="SSP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ufEmissor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF Emissor *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ufs.map((uf) => (
                            <SelectItem key={uf} value={uf}>
                              {uf}
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
                  name="dataEmissaoRg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Emissão RG *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="municipioNasc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Município Nasc. *</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 3333-3333" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIS</FormLabel>
                      <FormControl>
                        <Input placeholder="000.00000.00-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="nomeMae"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Mãe *</FormLabel>
                      <FormControl>
                        <Input placeholder="Maria Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nomePai"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Pai *</FormLabel>
                      <FormControl>
                        <Input placeholder="José Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sexo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP *</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Endereço *</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Av, etc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro *</FormLabel>
                      <FormControl>
                        <Input placeholder="Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade *</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número *</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resideDesdeMes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reside Desde (Mês) *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Mês" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                            <SelectItem key={mes} value={mes.toString()}>
                              {mes.toString().padStart(2, "0")}
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
                  name="resideDesdeAno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reside Desde (Ano) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2024"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                        />
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
              <CardTitle>Dados da Habilitação (CNH)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="numeroHabilitacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº Habilitação *</FormLabel>
                      <FormControl>
                        <Input placeholder="00000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cidadeCnh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade da CNH *</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoriaCnh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="AB">AB</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dataEmissaoCnh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Emissão CNH *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validadeCnh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validade CNH *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataPrimeiraCnh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data 1ª CNH *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="codSegurancaCnh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cód. Segurança CNH *</FormLabel>
                      <FormControl>
                        <Input placeholder="000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anexoCnh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anexar CNH</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input type="file" accept="image/*" onChange={handleFileChange} className="flex-1" />
                          {field.value && (
                            <Button type="button" variant="outline" size="icon">
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("anexoCnh") && (
                <div className="mt-4">
                  <img
                    src={form.watch("anexoCnh") || "/placeholder.svg"}
                    alt="CNH anexada"
                    className="max-w-md rounded-lg border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Motorista"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
