"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const CATEGORIAS_CNH = ["A", "B", "AB", "C", "D", "E", "AC", "AD", "AE"]

const ESTADOS_UF = [
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

interface Motorista {
  id: string
  primeiroNome: string
  nomeCompleto: string
  celular: string
  operadora: string | null
  cpf: string
  email: string
  dataNascimento: string
  rg: string
  orgaoEmissor: string
  ufEmissor: string
  municipioNasc: string
  dataEmissaoRg: string
  telefone: string | null
  nomeMae: string
  nomePai: string | null
  pis: string | null
  pais: string
  sexo: string
  cep: string
  endereco: string
  bairro: string
  cidade: string
  numero: string
  complemento: string | null
  resideDesde: string
  numHabilitacao: string
  cidadeCnh: string
  categoriaCnh: string
  dataEmissaoCnh: string
  validadeCnh: string
  dataPrimeiraCnh: string
  codSegurancaCnh: string
  anexoCnh: string | null
}

export default function EditarMotoristaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingCnh, setUploadingCnh] = useState(false)
  const [motorista, setMotorista] = useState<Motorista | null>(null)

  useEffect(() => {
    fetchMotorista()
  }, [resolvedParams.id])

  const fetchMotorista = async () => {
    try {
      const response = await fetch(`/api/motoristas/${resolvedParams.id}`)
      if (!response.ok) throw new Error("Erro ao buscar motorista")
      const data = await response.json()
      setMotorista(data)
    } catch (error: any) {
      toast( error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!motorista) return

    setSaving(true)
    try {
      const response = await fetch(`/api/motoristas/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(motorista),
      })

      if (!response.ok) throw new Error("Erro ao atualizar motorista")

      toast.success("Motorista atualizado com sucesso!")

      router.push("/motoristas")
    } catch (error: any) {
      toast.error( error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCnhUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !motorista) return

    setUploadingCnh(true)
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      setMotorista({ ...motorista, anexoCnh: base64 })

      toast.success("Foto da CNH carregada!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploadingCnh(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!motorista) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Motorista não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/motoristas">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/motoristas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Motorista</h1>
          <p className="text-muted-foreground">Atualize os dados do motorista</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Principais</CardTitle>
            <CardDescription>Informações básicas do motorista</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primeiroNome">Primeiro Nome *</Label>
                <Input
                  id="primeiroNome"
                  required
                  value={motorista.primeiroNome}
                  onChange={(e) => setMotorista({ ...motorista, primeiroNome: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                <Input
                  id="nomeCompleto"
                  required
                  value={motorista.nomeCompleto}
                  onChange={(e) => setMotorista({ ...motorista, nomeCompleto: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Celular *</Label>
                <Input
                  id="celular"
                  required
                  placeholder="(00) 00000-0000"
                  value={motorista.celular}
                  onChange={(e) => setMotorista({ ...motorista, celular: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operadora">Operadora</Label>
                <Input
                  id="operadora"
                  placeholder="Ex: Vivo, Claro, Tim..."
                  value={motorista.operadora || ""}
                  onChange={(e) => setMotorista({ ...motorista, operadora: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos / Registros</CardTitle>
            <CardDescription>Documentação pessoal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  required
                  placeholder="000.000.000-00"
                  value={motorista.cpf}
                  onChange={(e) => setMotorista({ ...motorista, cpf: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={motorista.email}
                  onChange={(e) => setMotorista({ ...motorista, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data Nascimento *</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  required
                  value={motorista.dataNascimento}
                  onChange={(e) => setMotorista({ ...motorista, dataNascimento: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rg">RG *</Label>
                <Input
                  id="rg"
                  required
                  value={motorista.rg}
                  onChange={(e) => setMotorista({ ...motorista, rg: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgaoEmissor">Órgão Emissor *</Label>
                <Input
                  id="orgaoEmissor"
                  required
                  placeholder="Ex: SSP"
                  value={motorista.orgaoEmissor}
                  onChange={(e) => setMotorista({ ...motorista, orgaoEmissor: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ufEmissor">UF Emissor *</Label>
                <Select
                  value={motorista.ufEmissor}
                  onValueChange={(value) => setMotorista({ ...motorista, ufEmissor: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_UF.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipioNasc">Município Nasc. *</Label>
                <Input
                  id="municipioNasc"
                  required
                  value={motorista.municipioNasc}
                  onChange={(e) => setMotorista({ ...motorista, municipioNasc: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataEmissaoRg">Data Emissão RG *</Label>
                <Input
                  id="dataEmissaoRg"
                  type="date"
                  required
                  value={motorista.dataEmissaoRg}
                  onChange={(e) => setMotorista({ ...motorista, dataEmissaoRg: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 0000-0000"
                  value={motorista.telefone || ""}
                  onChange={(e) => setMotorista({ ...motorista, telefone: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nomeMae">Nome da Mãe *</Label>
                <Input
                  id="nomeMae"
                  required
                  value={motorista.nomeMae}
                  onChange={(e) => setMotorista({ ...motorista, nomeMae: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nomePai">Nome do Pai</Label>
                <Input
                  id="nomePai"
                  value={motorista.nomePai || ""}
                  onChange={(e) => setMotorista({ ...motorista, nomePai: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pis">PIS</Label>
                <Input
                  id="pis"
                  placeholder="000.00000.00-0"
                  value={motorista.pis || ""}
                  onChange={(e) => setMotorista({ ...motorista, pis: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País *</Label>
                <Input
                  id="pais"
                  required
                  value={motorista.pais}
                  onChange={(e) => setMotorista({ ...motorista, pais: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo *</Label>
                <Select value={motorista.sexo} onValueChange={(value) => setMotorista({ ...motorista, sexo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="O">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  required
                  placeholder="00000-000"
                  value={motorista.cep}
                  onChange={(e) => setMotorista({ ...motorista, cep: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  required
                  value={motorista.endereco}
                  onChange={(e) => setMotorista({ ...motorista, endereco: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  required
                  value={motorista.bairro}
                  onChange={(e) => setMotorista({ ...motorista, bairro: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  required
                  value={motorista.cidade}
                  onChange={(e) => setMotorista({ ...motorista, cidade: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  required
                  value={motorista.numero}
                  onChange={(e) => setMotorista({ ...motorista, numero: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={motorista.complemento || ""}
                  onChange={(e) => setMotorista({ ...motorista, complemento: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="resideDesde">Reside Desde *</Label>
                <Input
                  id="resideDesde"
                  type="month"
                  required
                  value={motorista.resideDesde}
                  onChange={(e) => setMotorista({ ...motorista, resideDesde: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Habilitação (CNH)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numHabilitacao">Nº Habilitação *</Label>
                <Input
                  id="numHabilitacao"
                  required
                  value={motorista.numHabilitacao}
                  onChange={(e) => setMotorista({ ...motorista, numHabilitacao: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidadeCnh">Cidade da CNH *</Label>
                <Input
                  id="cidadeCnh"
                  required
                  value={motorista.cidadeCnh}
                  onChange={(e) => setMotorista({ ...motorista, cidadeCnh: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoriaCnh">Categoria *</Label>
                <Select
                  value={motorista.categoriaCnh}
                  onValueChange={(value) => setMotorista({ ...motorista, categoriaCnh: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_CNH.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataEmissaoCnh">Data Emissão *</Label>
                <Input
                  id="dataEmissaoCnh"
                  type="date"
                  required
                  value={motorista.dataEmissaoCnh}
                  onChange={(e) => setMotorista({ ...motorista, dataEmissaoCnh: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validadeCnh">Validade *</Label>
                <Input
                  id="validadeCnh"
                  type="date"
                  required
                  value={motorista.validadeCnh}
                  onChange={(e) => setMotorista({ ...motorista, validadeCnh: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataPrimeiraCnh">Data 1ª CNH *</Label>
                <Input
                  id="dataPrimeiraCnh"
                  type="date"
                  required
                  value={motorista.dataPrimeiraCnh}
                  onChange={(e) => setMotorista({ ...motorista, dataPrimeiraCnh: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codSegurancaCnh">Cód Segurança *</Label>
                <Input
                  id="codSegurancaCnh"
                  required
                  value={motorista.codSegurancaCnh}
                  onChange={(e) => setMotorista({ ...motorista, codSegurancaCnh: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anexoCnh">Anexar CNH</Label>
              <div className="flex items-center gap-4">
                <Input id="anexoCnh" type="file" accept="image/*" onChange={handleCnhUpload} disabled={uploadingCnh} />
                {uploadingCnh && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {motorista.anexoCnh && (
                <div className="mt-2">
                  <img src={motorista.anexoCnh || "/placeholder.svg"} alt="CNH" className="max-w-xs rounded border" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/motoristas">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
