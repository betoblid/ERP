"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import type { EstimateFormData } from "@/@types/estimate"
import { toast } from "sonner"

interface Customer {
  Id: string
  DisplayName: string
  PrimaryEmailAddr?: { Address: string }
  BillAddr?: any
}

interface Product {
  Id: string
  Name: string
  UnitPrice: number
  Description?: string
}

export default function NovoOrcamentoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const [formData, setFormData] = useState<EstimateFormData>({
    customerId: "",
    customerEmail: "",
    txnDate: new Date().toISOString().split("T")[0],
    expirationDate: "",
    acceptedDate: "",
    billAddr: {},
    shipAddr: {},
    items: [],
    discountPercent: 0,
    discountAccountId: "",
    customerMemo: "",
    privateNote: "",
    taxCodeId: "NON",
    applyTaxAfterDiscount: false,
  })

  useEffect(() => {
    loadCustomers()
    loadProducts()
  }, [])

  async function loadCustomers() {
    try {
      const response = await fetch("/api/clientes")
      if (!response.ok) throw new Error("Erro ao carregar clientes")
      const data = await response.json()
      setCustomers(data)
    } catch (error: any) {
      toast(error.message)
    }
  }

  async function loadProducts() {
    try {
      const response = await fetch("/api/produtos")
      if (!response.ok) throw new Error("Erro ao carregar produtos")
      const data = await response.json()
      setProducts(data)
    } catch (error: any) {
      toast(error.message)
    }
  }

  function handleCustomerChange(customerId: string) {
    const customer = customers.find((c) => c.Id === customerId)
    if (customer) {
      setSelectedCustomer(customer)
      setFormData((prev) => ({
        ...prev,
        customerId,
        customerEmail: customer.PrimaryEmailAddr?.Address || "",
        billAddr: customer.BillAddr || {},
      }))
    }
  }

  function addItem() {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxCode: "NON",
        },
      ],
    }))
  }

  function removeItem(index: number) {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  function updateItem(index: number, field: string, value: any) {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          if (field === "productId") {
            const product = products.find((p) => p.Id === value)
            return {
              ...item,
              productId: value,
              description: product?.Description || product?.Name || "",
              unitPrice: product?.UnitPrice || 0,
            }
          }
          return { ...item, [field]: value }
        }
        return item
      }),
    }))
  }

  function calculateSubtotal() {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  function calculateDiscount() {
    return (calculateSubtotal() * (formData.discountPercent || 0)) / 100
  }

  function calculateTotal() {
    return calculateSubtotal() - calculateDiscount()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (formData.items.length === 0) {
      toast("Adicione pelo menos um item")
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar orçamento")
      }

      toast("Orçamento criado com sucesso")

      router.push("/orcamentos")
    } catch (error: any) {
      toast( error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Orçamento</h1>
          <p className="text-muted-foreground">Criar um novo orçamento no QuickBooks</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente *</Label>
                <Select value={formData.customerId} onValueChange={handleCustomerChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.Id} value={customer.Id}>
                        {customer.DisplayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email do Cliente</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="txnDate">Data Estimada *</Label>
                <Input
                  id="txnDate"
                  type="date"
                  value={formData.txnDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, txnDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expirationDate">Data de Validade</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expirationDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="acceptedDate">Data de Aceite</Label>
                <Input
                  id="acceptedDate"
                  type="date"
                  value={formData.acceptedDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, acceptedDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Produtos ou Serviços</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </CardHeader>
          <CardContent>
            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item adicionado. Clique em "Adicionar Item" para começar.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label>Produto *</Label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => updateItem(index, "productId", value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.Id} value={product.Id}>
                                {product.Name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          placeholder="Descrição"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Quantidade *</Label>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", Number.parseFloat(e.target.value))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Preço Unit. *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", Number.parseFloat(e.target.value))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Total</Label>
                        <Input
                          value={new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "USD",
                          }).format(item.quantity * item.unitPrice)}
                          disabled
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="self-start"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notas e Observações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerMemo">Nota ao Cliente</Label>
                <Textarea
                  id="customerMemo"
                  value={formData.customerMemo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customerMemo: e.target.value }))}
                  placeholder="Obrigado pelo seu negócio!"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privateNote">Memorando sobre declaração (oculto)</Label>
                <Textarea
                  id="privateNote"
                  value={formData.privateNote}
                  onChange={(e) => setFormData((prev) => ({ ...prev, privateNote: e.target.value }))}
                  placeholder="Este memorando não aparecerá na estimativa, mas aparecerá no extrato."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "USD",
                  }).format(calculateSubtotal())}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="discount">Desconto (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discountPercent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountPercent: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-24"
                  />
                </div>
                {formData.discountPercent > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Desconto aplicado</span>
                    <span className="text-destructive">
                      -
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "USD",
                      }).format(calculateDiscount())}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "USD",
                  }).format(calculateTotal())}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar Orçamento"}
          </Button>
        </div>
      </form>
    </div>
  )
}
