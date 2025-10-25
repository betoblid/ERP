"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const TIPOS_VEICULO = ["Moto", "Fiorino", "VUC", "Van", "HR", "1/4", "Iveco", "Toco", "Truck"]

const CATEGORIAS_FROTA = ["Próprio", "Terceiro", "Agregado", "Alugado"]

const TIPOS_CARROCERIA = ["Baú", "Refrigerado", "Aberto", "Sider", "Caçamba", "Tanque", "Graneleiro"]

const ITENS_ADICIONAIS = [
  "Trava baú traseiro",
  "Trava baú lateral",
  "Sensor de baú traseiro",
  "Sensor de baú lateral",
  "Teclado",
  "Sensor de violação painel",
  "Sensor de porta dianteira esquerda",
  "Sensor de porta dianteira direita",
  "Botão de pânico",
]

interface Veiculo {
  id: string
  placa: string
  renavam: string
  marca: string
  modelo: string
  anoFabricacao: number
  anoModelo: number
  cor: string
  dataCompra: string | null
  baseOperacao: string
  tipoVeiculo: string
  categoriaFrota: string
  seguradora: string | null
  vigenciaSeguro: string | null
  taraVeiculo: number
  capacidadeCarga: number
  capacidadeCargaM3: number
  tipoCarroceria: string
  codigoEmpresarial: string | null
  ufEmplacada: string | null
  tipoRodado: string | null
  certificadoCronotacografo: string | null
  medidasRodado: string | null
  consumoKmLitro: number
  kmMaximoRota: number
  capacidadeTanque: number
  tipoResponsavel: string | null
  unidadeProprietaria: string | null
  financiamento: string | null
  instituicaoFinanceira: string | null
  tabela: string | null
  valorEntrega: number
  valorKmRodado: number
  valorDiaria: number
  itensAdicionais: string[]
}

export default function EditarVeiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null)

  useEffect(() => {
    fetchVeiculo()
  }, [resolvedParams.id])

  const fetchVeiculo = async () => {
    try {
      const response = await fetch(`/api/veiculos/${resolvedParams.id}`)
      if (!response.ok) throw new Error("Erro ao buscar veículo")
      const data = await response.json()
      setVeiculo(data)
    } catch (error: any) {
      toast(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!veiculo) return

    setSaving(true)
    try {
      const response = await fetch(`/api/veiculos/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(veiculo),
      })

      if (!response.ok) throw new Error("Erro ao atualizar veículo")

      toast( "Veículo atualizado com sucesso!")

      router.push("/veiculos")
    } catch (error: any) {
      toast( error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleItemToggle = (item: string) => {
    if (!veiculo) return
    setVeiculo({
      ...veiculo,
      itensAdicionais: veiculo.itensAdicionais.includes(item)
        ? veiculo.itensAdicionais.filter((i) => i !== item)
        : [...veiculo.itensAdicionais, item],
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!veiculo) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Veículo não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/veiculos">
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
          <Link href="/veiculos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Veículo</h1>
          <p className="text-muted-foreground">Atualize os dados do veículo {veiculo.placa}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  required
                  value={veiculo.placa}
                  onChange={(e) => setVeiculo({ ...veiculo, placa: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anoFabricacao">Ano Fabricação *</Label>
                <Input
                  id="anoFabricacao"
                  type="number"
                  required
                  value={veiculo.anoFabricacao}
                  onChange={(e) => setVeiculo({ ...veiculo, anoFabricacao: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anoModelo">Ano Modelo *</Label>
                <Input
                  id="anoModelo"
                  type="number"
                  required
                  value={veiculo.anoModelo}
                  onChange={(e) => setVeiculo({ ...veiculo, anoModelo: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseOperacao">Base de Operação *</Label>
                <Input
                  id="baseOperacao"
                  required
                  value={veiculo.baseOperacao}
                  onChange={(e) => setVeiculo({ ...veiculo, baseOperacao: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoVeiculo">Tipo Veículo *</Label>
                <Select
                  value={veiculo.tipoVeiculo}
                  onValueChange={(value) => setVeiculo({ ...veiculo, tipoVeiculo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_VEICULO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="renavam">RENAVAM *</Label>
                <Input
                  id="renavam"
                  required
                  value={veiculo.renavam}
                  onChange={(e) => setVeiculo({ ...veiculo, renavam: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor">Cor *</Label>
                <Input
                  id="cor"
                  required
                  value={veiculo.cor}
                  onChange={(e) => setVeiculo({ ...veiculo, cor: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoriaFrota">Categoria Frota *</Label>
                <Select
                  value={veiculo.categoriaFrota}
                  onValueChange={(value) => setVeiculo({ ...veiculo, categoriaFrota: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_FROTA.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  required
                  value={veiculo.marca}
                  onChange={(e) => setVeiculo({ ...veiculo, marca: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataCompra">Data de Compra</Label>
                <Input
                  id="dataCompra"
                  type="date"
                  value={veiculo.dataCompra || ""}
                  onChange={(e) => setVeiculo({ ...veiculo, dataCompra: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seguradora">Seguradora</Label>
                <Input
                  id="seguradora"
                  value={veiculo.seguradora || ""}
                  onChange={(e) => setVeiculo({ ...veiculo, seguradora: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vigenciaSeguro">Vigência Seguro</Label>
                <Input
                  id="vigenciaSeguro"
                  type="date"
                  value={veiculo.vigenciaSeguro || ""}
                  onChange={(e) => setVeiculo({ ...veiculo, vigenciaSeguro: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  required
                  value={veiculo.modelo}
                  onChange={(e) => setVeiculo({ ...veiculo, modelo: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacidades e Medidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taraVeiculo">Tara Veículo (kg) *</Label>
                <Input
                  id="taraVeiculo"
                  type="number"
                  required
                  value={veiculo.taraVeiculo}
                  onChange={(e) => setVeiculo({ ...veiculo, taraVeiculo: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidadeCarga">Capacidade de Carga (kg) *</Label>
                <Input
                  id="capacidadeCarga"
                  type="number"
                  required
                  value={veiculo.capacidadeCarga}
                  onChange={(e) => setVeiculo({ ...veiculo, capacidadeCarga: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidadeCargaM3">Capacidade em M3 *</Label>
                <Input
                  id="capacidadeCargaM3"
                  type="number"
                  required
                  step="0.01"
                  value={veiculo.capacidadeCargaM3}
                  onChange={(e) => setVeiculo({ ...veiculo, capacidadeCargaM3: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoCarroceria">Tipo de Carroceria *</Label>
                <Select
                  value={veiculo.tipoCarroceria}
                  onValueChange={(value) => setVeiculo({ ...veiculo, tipoCarroceria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CARROCERIA.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidadeTanque">Capacidade Tanque (L) *</Label>
                <Input
                  id="capacidadeTanque"
                  type="number"
                  required
                  value={veiculo.capacidadeTanque}
                  onChange={(e) => setVeiculo({ ...veiculo, capacidadeTanque: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumoKmLitro">Consumo (km/L)</Label>
                <Input
                  id="consumoKmLitro"
                  type="number"
                  step="0.1"
                  value={veiculo.consumoKmLitro}
                  onChange={(e) => setVeiculo({ ...veiculo, consumoKmLitro: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kmMaximoRota">KM Máximo por Rota</Label>
                <Input
                  id="kmMaximoRota"
                  type="number"
                  value={veiculo.kmMaximoRota}
                  onChange={(e) => setVeiculo({ ...veiculo, kmMaximoRota: Number.parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custos e Tabela</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tabela">Tabela</Label>
                <Input
                  id="tabela"
                  value={veiculo.tabela || ""}
                  onChange={(e) => setVeiculo({ ...veiculo, tabela: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorEntrega">Valor por Entrega (R$) *</Label>
                <Input
                  id="valorEntrega"
                  type="number"
                  required
                  step="0.01"
                  value={veiculo.valorEntrega}
                  onChange={(e) => setVeiculo({ ...veiculo, valorEntrega: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorKmRodado">Valor por KM (R$) *</Label>
                <Input
                  id="valorKmRodado"
                  type="number"
                  required
                  step="0.01"
                  value={veiculo.valorKmRodado}
                  onChange={(e) => setVeiculo({ ...veiculo, valorKmRodado: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorDiaria">Valor por Diária (R$) *</Label>
                <Input
                  id="valorDiaria"
                  type="number"
                  required
                  step="0.01"
                  value={veiculo.valorDiaria}
                  onChange={(e) => setVeiculo({ ...veiculo, valorDiaria: Number.parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens Adicionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ITENS_ADICIONAIS.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={item}
                    checked={veiculo.itensAdicionais.includes(item)}
                    onCheckedChange={() => handleItemToggle(item)}
                  />
                  <label htmlFor={item} className="text-sm cursor-pointer">
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/veiculos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
