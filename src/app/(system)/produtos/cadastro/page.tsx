"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Barcode } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import api from "@/lib/api"
import { Categoria } from "@/@types"

export default function CadastroProduto() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [listCategory, setListCategory] = useState<Categoria[] | []>([])

  useEffect(() => {
    const getCategoryAll = async () => {
      const response = await api.get("/categoria")



      setListCategory(response.data)
    }
    getCategoryAll();


  }, [])

  const [formData, setFormData] = useState({
    nome: "",
    codigoBarras: "",
    categoriaId: "",
    preco: "",
    fornecedor: "",
    estoqueAtual: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoriaId: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      //chamada de API
      const response = await api.post("/produto", formData)

      if (response.status === 201) {
        toast(`${formData.nome} foi adicionado ao sistema.`)
        router.push("/produtos")
      }

    } catch (error) {
      toast("Ocorreu um erro ao processar sua solicitação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateBarcode = () => {
    // Gera um código de barras aleatório
    const randomCode = Math.floor(Math.random() * 10000000000)
      .toString()
      .padStart(10, "0")
    setFormData((prev) => ({ ...prev, codigoBarras: randomCode }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/produtos">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Cadastro de Produto</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>Preencha os dados do novo produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Digite o nome do produto"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigoBarras">Código de Barras</Label>
                <div className="flex gap-2">
                  <Input
                    id="codigoBarras"
                    name="codigoBarras"
                    placeholder="Digite ou gere o código de barras"
                    value={formData.codigoBarras}
                    onChange={handleChange}
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateBarcode}>
                    <Barcode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoriaId">Categoria</Label>
                <Select onValueChange={handleSelectChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-black">
                    {
                      listCategory.length >= 1 && (
                        listCategory.map((item) => (
                          <SelectItem key={item.nome} value={item.id.toString()}>{item.nome}</SelectItem>
                        ))
                      )
                    }
                    {
                      listCategory.length <= 0 && (<SelectItem value="1" disabled>Não tem categoria cadastrada</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  name="preco"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.preco}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  name="fornecedor"
                  placeholder="Nome do fornecedor"
                  value={formData.fornecedor}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estoqueAtual">Quantidade em Estoque</Label>
                <Input
                  id="estoqueAtual"
                  name="estoqueAtual"
                  type="number"
                  placeholder="0"
                  value={formData.estoqueAtual}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/produtos">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cadastrar Produto
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

