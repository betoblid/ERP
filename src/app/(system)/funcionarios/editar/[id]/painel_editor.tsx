"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FiArrowLeft, FiSave } from "react-icons/fi"
import api from "@/lib/api"
import type { Funcionario } from "@/@types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const funcionarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
  cargo: z.string().min(3, "Cargo deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  jornadaInicio: z.string().min(1, "Horário de início é obrigatório"),
  jornadaFim: z.string().min(1, "Horário de fim é obrigatório"),
})

type FuncionarioFormData = z.infer<typeof funcionarioSchema>


interface PagePainelEditor {
    id: string
}

export function PainelEditor({id}: PagePainelEditor) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FuncionarioFormData>({
    resolver: zodResolver(funcionarioSchema),
  })

  useEffect(() => {

    if (id) {
      api.get<Funcionario>(`/funcionario/${id}`)
        .then((response) => {
          const funcionario = response.data
          reset({
            nome: funcionario.nome,
            cpf: funcionario.cpf,
            cargo: funcionario.cargo,
            email: funcionario.email,
            jornadaInicio: funcionario.jornadaInicio,
            jornadaFim: funcionario.jornadaFim,
          })
        })
        .catch((error) => {
          console.error("Error fetching funcionario:", error)
          toast.error("Erro ao carregar dados do funcionário")
          router.push("/funcionarios")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [id, reset, router])

  const onSubmit = async (data: FuncionarioFormData) => {
    setIsSaving(true)
    try {
      await api.put(`/funcionario/${id}`, data)
      toast.success("Funcionário atualizado com sucesso!")
      router.push("/funcionarios")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar funcionário")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/funcionarios" className="btn btn-secondary mr-4">
          <FiArrowLeft className="mr-2" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Editar Funcionário</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <Label  htmlFor="nome"  >
              Nome Completo
              </Label>
              <Input type="text" id="nome" autoComplete="name" {...register("nome")}/>
              {errors.nome && <p className="form-error">{errors.nome.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="cpf" className="form-label">
                CPF
              </label>
              <Input type="text" id="cpf"  {...register("cpf")} />
              {errors.cpf && <p className="form-error">{errors.cpf.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="cargo" className="form-label">
                Cargo
              </label>
              <Input type="text" id="cargo"  {...register("cargo")} />
              {errors.cargo && <p className="form-error">{errors.cargo.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <Input type="email" id="email"  {...register("email")} />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="jornadaInicio" className="form-label">
                Início da Jornada
              </label>
              <Input type="time" id="jornadaInicio"  {...register("jornadaInicio")} />
              {errors.jornadaInicio && <p className="form-error">{errors.jornadaInicio.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="jornadaFim" className="form-label">
                Fim da Jornada
              </label>
              <Input type="time" id="jornadaFim"  {...register("jornadaFim")} />
              {errors.jornadaFim && <p className="form-error">{errors.jornadaFim.message}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <Link href="/funcionarios" className="btn btn-secondary text-base font-semibold">
              Cancelar
            </Link>
            <button type="submit" className="text-base flex items-center justify-center gap-1 cursor-pointer" disabled={isSaving}>
              {isSaving ? (
                "Salvando..."
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

