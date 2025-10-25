"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const formSchema = z.object({
  Name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  QtyOnHand: z.coerce.number().min(0, "Quantidade não pode ser negativa"),
  InvStartDate: z.string().min(1, "Data é obrigatória"),
  TrackQtyOnHand: z.boolean().default(true),
  Active: z.boolean().default(true),
  UnitPrice: z.coerce.number().min(0, "Preço não pode ser negativo"),
  PurchaseCost: z.coerce.number().min(0, "Custo não pode ser negativo"),
  Description: z.string().optional(),
  PurchaseDesc: z.string().optional(),
  Taxable: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

export default function CadastroProdutoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      TrackQtyOnHand: true,
      Active: true,
      Taxable: true,
      InvStartDate: new Date().toISOString().split("T")[0],
    },
  })

  const trackQtyOnHand = watch("TrackQtyOnHand")
  const active = watch("Active")
  const taxable = watch("Taxable")

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.Fault?.Error?.[0]?.Message || "Erro ao cadastrar produto")
      }

      const produto = await response.json()

      toast.success("Produto cadastrado com sucesso!", {
        description: `${produto.Name} foi adicionado ao QuickBooks.`,
      })

      router.push("/produtos")
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error)
      toast.error("Erro ao cadastrar produto", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/produtos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastro de Produto</h1>
          <p className="text-muted-foreground">Criar novo item no QuickBooks</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>Preencha os dados do produto para cadastro no QuickBooks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Name">Nome do Produto *</Label>
                <Input id="Name" placeholder="Ex: Garden Supplies" {...register("Name")} />
                {errors.Name && <p className="text-sm text-destructive">{errors.Name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="InvStartDate">Data de Início do Inventário *</Label>
                <Input id="InvStartDate" type="date" {...register("InvStartDate")} />
                {errors.InvStartDate && <p className="text-sm text-destructive">{errors.InvStartDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="QtyOnHand">Quantidade em Estoque *</Label>
                <Input id="QtyOnHand" type="number" min="0" placeholder="0" {...register("QtyOnHand")} />
                {errors.QtyOnHand && <p className="text-sm text-destructive">{errors.QtyOnHand.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="UnitPrice">Preço de Venda (R$) *</Label>
                <Input id="UnitPrice" type="number" step="0.01" min="0" placeholder="0.00" {...register("UnitPrice")} />
                {errors.UnitPrice && <p className="text-sm text-destructive">{errors.UnitPrice.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="PurchaseCost">Custo de Compra (R$) *</Label>
                <Input
                  id="PurchaseCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("PurchaseCost")}
                />
                {errors.PurchaseCost && <p className="text-sm text-destructive">{errors.PurchaseCost.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="Description">Descrição</Label>
                <Input id="Description" placeholder="Descrição do produto" {...register("Description")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="PurchaseDesc">Descrição de Compra</Label>
                <Input id="PurchaseDesc" placeholder="Descrição para compras" {...register("PurchaseDesc")} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="TrackQtyOnHand"
                  checked={trackQtyOnHand}
                  onCheckedChange={(checked) => setValue("TrackQtyOnHand", !!checked)}
                />
                <Label htmlFor="TrackQtyOnHand" className="cursor-pointer">
                  Rastrear Quantidade em Estoque
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="Active" checked={active} onCheckedChange={(checked) => setValue("Active", !!checked)} />
                <Label htmlFor="Active" className="cursor-pointer">
                  Produto Ativo
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="Taxable"
                  checked={taxable}
                  onCheckedChange={(checked) => setValue("Taxable", !!checked)}
                />
                <Label htmlFor="Taxable" className="cursor-pointer">
                  Produto Tributável
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/produtos">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cadastrar Produto
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
