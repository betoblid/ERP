"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const formSchema = z.object({
  Name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
})

type FormValues = z.infer<typeof formSchema>

export default function EditarCategoriaPage() {
  const router = useRouter()
  const params = useParams()
  const categoriaId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    fetchCategoria()
  }, [categoriaId])

  const fetchCategoria = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/categorias/${categoriaId}`)

      if (!response.ok) {
        throw new Error("Erro ao buscar categoria")
      }

      const categoria = await response.json()
      setValue("Name", categoria.Name)
    } catch (error) {
      console.error("Erro ao buscar categoria:", error)
      toast.error("Erro ao buscar categoria")
      router.push("/categorias")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/categorias/${categoriaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.Fault?.Error?.[0]?.Message || "Erro ao atualizar categoria")
      }

      const categoria = await response.json()

      toast.success("Categoria atualizada com sucesso!", {
        description: `${categoria.Name} foi atualizada no QuickBooks.`,
      })

      router.push("/categorias")
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error)
      toast.error("Erro ao atualizar categoria", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">Editar Categoria</h1>
          <p className="text-muted-foreground">Atualizar informações da categoria no QuickBooks</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Categoria</CardTitle>
            <CardDescription>Atualize o nome da categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="Name">Nome da Categoria *</Label>
              <Input id="Name" {...register("Name")} />
              {errors.Name && <p className="text-sm text-destructive">{errors.Name.message}</p>}
            </div>
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
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
