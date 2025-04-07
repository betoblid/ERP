"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Barcode, Camera, Check, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Dados simulados de produtos
const produtos = [
  { codigo: "CB-CAT6-001", nome: "Cabo de Rede Cat6", os: "OS-2023-001" },
  { codigo: "RT-WL-002", nome: "Roteador Wireless", os: "OS-2023-002" },
  { codigo: "SW-24P-003", nome: "Switch 24 portas", os: "OS-2023-001" },
]

export default function RetiradaPage() {
  

 
  const [codigo, setCodigo] = useState("")
  const [os, setOs] = useState("")
  const [scanMode, setScanMode] = useState(false)
  const [resultado, setResultado] = useState<{
    status: "success" | "error" | null
    mensagem: string
    produto?: (typeof produtos)[0]
  } | null>(null)

  const handleScan = () => {
    // Simulando leitura de código de barras
    setScanMode(true)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * produtos.length)
      const produtoSelecionado = produtos[randomIndex]
      setCodigo(produtoSelecionado.codigo)
      setScanMode(false)
    }, 2000)
  }

  const verificarProduto = () => {
    if (!codigo || !os) {
     

    const produtoEncontrado = produtos.find((p) => p.codigo === codigo)

    if (!produtoEncontrado) {
      setResultado({
        status: "error",
        mensagem: "Produto não encontrado no sistema",
      })
      return
    }

    if (produtoEncontrado.os === os) {
      setResultado({
        status: "success",
        mensagem: "Produto verificado com sucesso! Pode ser retirado.",
        produto: produtoEncontrado,
      })
    } else {
      setResultado({
        status: "error",
        mensagem: `Produto não pertence à OS ${os}. Retirada bloqueada.`,
        produto: produtoEncontrado,
      })
    }
  }

  const confirmarRetirada = () => {
    if (resultado?.status === "success") {
      

      // Limpar o formulário
      setCodigo("")
      setOs("")
      setResultado(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Retirada de Produtos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Scanner de Código de Barras</CardTitle>
          <CardDescription>Escaneie o código de barras do produto para verificar se pode ser retirado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Produto</Label>
              <div className="flex gap-2">
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Digite ou escaneie o código"
                  disabled={scanMode}
                />
                <Button type="button" variant="outline" onClick={handleScan} disabled={scanMode}>
                  {scanMode ? "Escaneando..." : <Camera className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="os">Número da OS</Label>
              <Input id="os" value={os} onChange={(e) => setOs(e.target.value)} placeholder="Ex: OS-2023-001" />
            </div>
          </div>

          <Button onClick={verificarProduto} disabled={!codigo || !os || scanMode} className="w-full">
            <Barcode className="mr-2 h-4 w-4" />
            Verificar Produto
          </Button>

          {resultado && (
            <Alert variant={resultado.status === "success" ? "default" : "destructive"}>
              {resultado.status === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <AlertTitle>
                {resultado.status === "success" ? "Verificação bem-sucedida" : "Erro na verificação"}
              </AlertTitle>
              <AlertDescription>
                {resultado.mensagem}
                {resultado.produto && (
                  <div className="mt-2">
                    <p>
                      <strong>Produto:</strong> {resultado.produto.nome}
                    </p>
                    <p>
                      <strong>Código:</strong> {resultado.produto.codigo}
                    </p>
                    <p>
                      <strong>OS Associada:</strong> {resultado.produto.os}
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        {resultado?.status === "success" && (
          <CardFooter>
            <Button onClick={confirmarRetirada} className="w-full">
              <Check className="mr-2 h-4 w-4" />
              Confirmar Retirada
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}}