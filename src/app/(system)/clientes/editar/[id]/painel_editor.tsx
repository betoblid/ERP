"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FiArrowLeft, FiSave } from "react-icons/fi"
import api from "@/lib/api"
import type { Cliente } from "@/@types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const clienteSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    tipoDocumento: z.string().min(1, "Tipo de documento é obrigatório"),
    documento: z.string().min(1, "Documento é obrigatório"),
    endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
    telefone: z.string().min(8, "Telefone deve ter pelo menos 8 caracteres"),
    email: z.string().email("Email inválido"),
})

type ClienteFormData = z.infer<typeof clienteSchema>

export function EditarCliente({ id }: { id: string }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
    } = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
    })

    const handleRadioChange = (value: string) => {
        setValue("tipoDocumento", value)
    }

    useEffect(() => {
        if (id) {
            api.get<Cliente>(`/cliente/${id}`)
                .then((response) => {
                    const cliente = response.data
                    reset({
                        nome: cliente.nome,
                        tipoDocumento: cliente.tipoDocumento,
                        documento: cliente.documento,
                        endereco: cliente.endereco,
                        telefone: cliente.telefone,
                        email: cliente.email,
                    })
                })
                .catch((error) => {
                    console.error("Error fetching cliente:", error)
                    toast.error("Erro ao carregar dados do cliente")
                    router.push("/clientes")
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }, [id, reset, router])

    const onSubmit = async (data: ClienteFormData) => {
        setIsSaving(true)
        try {
            await api.put(`/clientes/${id}`, data)
            toast.success("Cliente atualizado com sucesso!")
            router.push("/clientes")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao atualizar cliente")
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
                <Link href="/clientes" className="btn btn-secondary mr-4">
                    <FiArrowLeft className="mr-2" />
                    Voltar
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <Label htmlFor="nome" className="form-Label">
                                Nome / Razão Social
                            </Label>
                            <Input type="text" id="nome" className="form-Input" {...register("nome")} />
                            {errors.nome && <p className="form-error">{errors.nome.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Documento</Label>
                            <RadioGroup defaultValue="cpf" onValueChange={handleRadioChange} className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cpf" id="cpf" />
                                    <Label htmlFor="cpf">CPF</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cnpj" id="cnpj" />
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                </div>
                            </RadioGroup>

                            <div className="form-group">
                                <Label htmlFor="documento" className="form-Label">
                                    Documento
                                </Label>
                                <Input type="text" id="documento" className="form-Input" {...register("documento")} />
                                {errors.documento && <p className="form-error">{errors.documento.message}</p>}
                            </div>

                            <div className="form-group">
                                <Label htmlFor="email" className="form-Label">
                                    Email
                                </Label>
                                <Input type="email" id="email" className="form-Input" {...register("email")} />
                                {errors.email && <p className="form-error">{errors.email.message}</p>}
                            </div>

                            <div className="form-group">
                                <Label htmlFor="telefone" className="form-Label">
                                    Telefone
                                </Label>
                                <Input type="text" id="telefone" className="form-Input" {...register("telefone")} />
                                {errors.telefone && <p className="form-error">{errors.telefone.message}</p>}
                            </div>

                            <div className="form-group md:col-span-2">
                                <Label htmlFor="endereco" className="form-Label">
                                    Endereço
                                </Label>
                                <Input type="text" id="endereco" className="form-Input" {...register("endereco")} />
                                {errors.endereco && <p className="form-error">{errors.endereco.message}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end mt-6 space-x-4">
                            <Link href="/clientes" className="btn btn-secondary">
                                Cancelar
                            </Link>
                            <button type="submit" className="btn btn-primary flex items-center" disabled={isSaving}>
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
                    </div>
                </form>
            </div>
        </div>
    )
}

