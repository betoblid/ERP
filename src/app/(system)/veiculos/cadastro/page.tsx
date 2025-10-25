"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function CadastroVeiculoPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    placa: "",
    renavam: "",
    marca: "",
    modelo: "",
    anoFabricacao: new Date().getFullYear(),
    anoModelo: new Date().getFullYear(),
    cor: "",
    dataCompra: "",
    baseOperacao: "",
    tipoVeiculo: "",
    categoriaFrota: "",
    seguradora: "",
    vigenciaSeguro: "",
    taraVeiculo: 0,
    capacidadeCarga: 0,
    capacidadeCargaM3: 0,
    tipoCarroceria: "",
    codigoEmpresarial: "",
    ufEmplacada: "",
    tipoRodado: "",
    certificadoCronotacografo: "",
    medidasRodado: "",
    consumoKmLitro: 0,
    kmMaximoRota: 0,
    capacidadeTanque: 0,
    tipoResponsavel: "",
    unidadeProprietaria: "",
    financiamento: "",
    instituicaoFinanceira: "",
    tabela: "",
    valorEntrega: 0,
    valorKmRodado: 0,
    valorDiaria: 0,
    itensAdicionais: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/veiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Erro ao cadastrar veículo")

      toast( "Veículo cadastrado com sucesso!")

      router.push("/veiculos")
    } catch (error: any) {
      toast( error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleItemToggle = (item: string) => {
    setFormData({
      ...formData,
      itensAdicionais: formData.itensAdicionais.includes(item)
        ? formData.itensAdicionais.filter((i) => i !== item)
        : [...formData.itensAdicionais, item],
    })
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
          <h1 className="text-3xl font-bold">Novo Veículo</h1>
          <p className="text-muted-foreground">Cadastre um novo veículo na frota</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Consulta de Veículo</CardTitle>
            <CardDescription>Dados principais do veículo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  required
                  placeholder="ABC1234"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anoFabricacao">Ano Fabricação *</Label>
                <Input
                  id="anoFabricacao"
                  type="number"
                  required
                  value={formData.anoFabricacao}
                  onChange={(e) => setFormData({ ...formData, anoFabricacao: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anoModelo">Ano Modelo *</Label>
                <Input
                  id="anoModelo"
                  type="number"
                  required
                  value={formData.anoModelo}
                  onChange={(e) => setFormData({ ...formData, anoModelo: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseOperacao">Base de Operação *</Label>
                <Input
                  id="baseOperacao"
                  required
                  value={formData.baseOperacao}
                  onChange={(e) => setFormData({ ...formData, baseOperacao: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoVeiculo">Tipo Veículo *</Label>
                <Select
                  value={formData.tipoVeiculo}
                  onValueChange={(value) => setFormData({ ...formData, tipoVeiculo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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
                  value={formData.renavam}
                  onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor">Cor *</Label>
                <Input
                  id="cor"
                  required
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoriaFrota">Categoria Frota *</Label>
                <Select
                  value={formData.categoriaFrota}
                  onValueChange={(value) => setFormData({ ...formData, categoriaFrota: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataCompra">Data de Compra</Label>
                <Input
                  id="dataCompra"
                  type="date"
                  value={formData.dataCompra}
                  onChange={(e) => setFormData({ ...formData, dataCompra: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seguradora">Seguradora</Label>
                <Input
                  id="seguradora"
                  value={formData.seguradora}
                  onChange={(e) => setFormData({ ...formData, seguradora: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vigenciaSeguro">Vigência Seguro</Label>
                <Input
                  id="vigenciaSeguro"
                  type="date"
                  value={formData.vigenciaSeguro}
                  onChange={(e) => setFormData({ ...formData, vigenciaSeguro: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  required
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
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
                  value={formData.taraVeiculo}
                  onChange={(e) => setFormData({ ...formData, taraVeiculo: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidadeCarga">Capacidade de Carga (kg) *</Label>
                <Input
                  id="capacidadeCarga"
                  type="number"
                  required
                  value={formData.capacidadeCarga}
                  onChange={(e) => setFormData({ ...formData, capacidadeCarga: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidadeCargaM3">Capacidade em M3 *</Label>
                <Input
                  id="capacidadeCargaM3"
                  type="number"
                  required
                  step="0.01"
                  value={formData.capacidadeCargaM3}
                  onChange={(e) => setFormData({ ...formData, capacidadeCargaM3: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoCarroceria">Tipo de Carroceria *</Label>
                <Select
                  value={formData.tipoCarroceria}
                  onValueChange={(value) => setFormData({ ...formData, tipoCarroceria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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
                  value={formData.capacidadeTanque}
                  onChange={(e) => setFormData({ ...formData, capacidadeTanque: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumoKmLitro">Consumo (km/L)</Label>
                <Input
                  id="consumoKmLitro"
                  type="number"
                  step="0.1"
                  value={formData.consumoKmLitro}
                  onChange={(e) => setFormData({ ...formData, consumoKmLitro: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kmMaximoRota">KM Máximo por Rota</Label>
                <Input
                  id="kmMaximoRota"
                  type="number"
                  value={formData.kmMaximoRota}
                  onChange={(e) => setFormData({ ...formData, kmMaximoRota: Number.parseFloat(e.target.value) })}
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
                  value={formData.tabela}
                  onChange={(e) => setFormData({ ...formData, tabela: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorEntrega">Valor por Entrega (R$) *</Label>
                <Input
                  id="valorEntrega"
                  type="number"
                  required
                  step="0.01"
                  value={formData.valorEntrega}
                  onChange={(e) => setFormData({ ...formData, valorEntrega: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorKmRodado">Valor por KM (R$) *</Label>
                <Input
                  id="valorKmRodado"
                  type="number"
                  required
                  step="0.01"
                  value={formData.valorKmRodado}
                  onChange={(e) => setFormData({ ...formData, valorKmRodado: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorDiaria">Valor por Diária (R$) *</Label>
                <Input
                  id="valorDiaria"
                  type="number"
                  required
                  step="0.01"
                  value={formData.valorDiaria}
                  onChange={(e) => setFormData({ ...formData, valorDiaria: Number.parseFloat(e.target.value) })}
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
                    checked={formData.itensAdicionais.includes(item)}
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
            Cadastrar Veículo
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/veiculos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
