"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const formSchema = z.object({
  Name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  SubItem: z.boolean().default(false),
  ParentRef: z
    .object({
      value: z.string(),
      name: z.string(),
    })
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Category {
  Id: string
  Name: string
}

export default function CadastroCategoriaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      SubItem: false,
    },
  })

  const isSubItem = watch("SubItem")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categorias")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      const payload: any = {
        Name: data.Name,
        SubItem: data.SubItem,
      }

      if (data.SubItem && data.ParentRef) {
        payload.ParentRef = data.ParentRef
      }

      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.Fault?.Error?.[0]?.Message || "Erro ao cadastrar categoria")
      }

      const categoria = await response.json()

      toast.success("Categoria cadastrada com sucesso!", {
        description: `${categoria.Name} foi adicionada ao QuickBooks.`,
      })

      router.push("/categorias")
    } catch (error) {
      console.error("Erro ao cadastrar categoria:", error)
      toast.error("Erro ao cadastrar categoria", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/categorias">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastro de Categoria</h1>
          <p className="text-muted-foreground">Criar nova categoria de produtos no QuickBooks</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Categoria</CardTitle>
            <CardDescription>Preencha os dados da categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="Name">Nome da Categoria *</Label>
              <Input id="Name" placeholder="Ex: Eletrônicos" {...register("Name")} />
              {errors.Name && <p className="text-sm text-destructive">{errors.Name.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="SubItem"
                checked={isSubItem}
                onCheckedChange={(checked) => setValue("SubItem", !!checked)}
              />
              <Label htmlFor="SubItem" className="cursor-pointer">
                É uma subcategoria?
              </Label>
            </div>

            {isSubItem && (
              <div className="space-y-2">
                <Label htmlFor="ParentRef">Categoria Pai *</Label>
                <Select
                  onValueChange={(value) => {
                    const parent = categories.find((c) => c.Id === value)
                    if (parent) {
                      setValue("ParentRef", { value: parent.Id, name: parent.Name })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria pai" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.Id} value={category.Id}>
                        {category.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/categorias">
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
                  Cadastrar Categoria
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
