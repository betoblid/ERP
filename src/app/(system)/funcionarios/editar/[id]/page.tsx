"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import api from "@/lib/api"
import type { Funcionario } from "@/@types"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

// Schema de validação
const funcionarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
  cargo: z.string().min(3, "Cargo deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  jornadaInicio: z.string().min(1, "Horário de início é obrigatório"),
  jornadaFim: z.string().min(1, "Horário de fim é obrigatório"),
})

type FuncionarioFormData = z.infer<typeof funcionarioSchema>

export default function EditarFuncionarioPage() {
  const router = useRouter()
  const params = useParams()
  const funcionarioId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null)

  const {
     register,
     handleSubmit,
     formState: { errors },
     reset,
   } = useForm<FuncionarioFormData>({
     resolver: zodResolver(funcionarioSchema),
   })

  // Carregar dados do funcionário
  useEffect(() => {
    const fetchFuncionario = async () => {
      setIsLoading(true)
      try {
        const response = await api.get(`/funcionario/${funcionarioId}`)
        const funcionarioData = response.data

        setFuncionario(funcionarioData)

        // Preencher o formulário com os dados do funcionário
        reset({
          nome: funcionarioData.nome,
          email: funcionarioData.email,
          cpf: funcionarioData.cpf,
          cargo: funcionarioData.cargo,
          jornadaInicio: funcionarioData.jornadaInicio,
          jornadaFim: funcionarioData.jornadaFim,

        })
      } catch (error) {
        console.error("Erro ao carregar funcionário:", error)
        toast("Não foi possível carregar os dados do funcionário.")
        router.push("/funcionarios")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFuncionario()
  }, [funcionarioId, router])

  const onSubmit = async (values: FuncionarioFormData) => {
    setIsSubmitting(true)

    try {
      await api.put(`/funcionario/${funcionarioId}`, values)

      toast(`Os dados de ${values.nome} foram atualizados.`)

      router.push("/funcionarios")
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error)
      toast("Ocorreu um erro ao processar sua solicitação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando dados do funcionário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title={`Editar Funcionário: ${funcionario?.nome}`}
        description="Atualize as informações do funcionário"
        breadcrumbs={[{ label: "Funcionários", href: "/funcionarios" }, { label: `Editar Funcionário` }]}
        actions={
          <Button variant="outline" onClick={() => router.push("/funcionarios")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />

     
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Funcionário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <Label  htmlFor="nome"  >
              Nome Completo
              </Label>
              <Input type="text" id="nome" autoComplete="name" {...register("nome")}/>
              {errors.nome && <p className="form-error">{errors.nome.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="cpf" >
                CPF
              </label>
              <Input type="text" id="cpf"  {...register("cpf")} />
              {errors.cpf && <p className="form-error">{errors.cpf.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="cargo" >
                Cargo
              </label>
              <Input type="text" id="cargo"  {...register("cargo")} />
              {errors.cargo && <p className="form-error">{errors.cargo.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email" >
                Email
              </label>
              <Input type="email" id="email"  {...register("email")} />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="jornadaInicio" >
                Início da Jornada
              </label>
              <Input type="time" id="jornadaInicio"  {...register("jornadaInicio")} />
              {errors.jornadaInicio && <p className="form-error">{errors.jornadaInicio.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="jornadaFim" >
                Fim da Jornada
              </label>
              <Input type="time" id="jornadaFim"  {...register("jornadaFim")} />
              {errors.jornadaFim && <p className="form-error">{errors.jornadaFim.message}</p>}
            </div>
          </div>

          
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/funcionarios")}>
                Cancelar
              </Button>
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
