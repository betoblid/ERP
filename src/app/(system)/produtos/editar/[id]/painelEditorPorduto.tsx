"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FiArrowLeft, FiSave } from "react-icons/fi"
import api from "@/lib/api"
import type { Produto, Categoria } from "@/@types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const produtoSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    codigo: z.string().min(3, "Código deve ter pelo menos 3 caracteres"),
    preco: z.coerce.number().positive("Preço deve ser positivo"),
    estoque: z.coerce.number().int().nonnegative("Estoque não pode ser negativo"),
    estoqueMinimo: z.coerce.number().int().nonnegative("Estoque mínimo não pode ser negativo"),
    fornecedor: z.string().min(3, "Fornecedor deve ter pelo menos 3 caracteres"),
    categoriaId: z.coerce.number().positive("Selecione uma categoria"),
})

type ProdutoFormData = z.infer<typeof produtoSchema>

export default function PainelEditorPorduto({ id }: { id: string }) {
    const router = useRouter()
    const [listCategory, setListCategory] = useState<Categoria[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)


    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue
    } = useForm<ProdutoFormData>({
        resolver: zodResolver(produtoSchema),
    })

    const CategoyWath = watch("categoriaId")

    const handleSelectChange = (value: string) => {
        setValue("categoriaId", Number(value))
      }

    useEffect(() => {
        if (id) {
            Promise.all([api.get<Produto>(`/produto/${id}`), api.get<Categoria[]>("/categoria")])
                .then(([produtoRes, categoriasRes]) => {
                    const produto = produtoRes.data
                    setListCategory(categoriasRes.data)
                    reset({
                        nome: produto.nome,
                        codigo: produto.codigoBarras,
                        preco: produto.preco,
                        estoque: produto.estoqueAtual,
                        estoqueMinimo: produto.estoqueMinimo,
                        fornecedor: produto.fornecedor,
                        categoriaId: produto.categoriaId,
                    })
                })
                .catch((error) => {
                    console.error("Error fetching data:", error)
                    toast.error("Erro ao carregar dados do produto")
                    router.push("/produtos")
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }, [id, reset, router])

    const onSubmit = async (data: ProdutoFormData) => {
        setIsSaving(true)
        try {
            await api.put(`/produto/${id}`, data)
            toast.success("Produto atualizado com sucesso!")
            router.push("/produtos")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao atualizar produto")
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
                <Link href="/produtos" className="btn btn-secondary mr-4">
                    <FiArrowLeft className="mr-2" />
                    Voltar
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <Label htmlFor="nome" className="form-label">
                                Nome do Produto
                            </Label>
                            <Input type="text" id="nome" className="form-input" {...register("nome")} />
                            {errors.nome && <p className="form-error">{errors.nome.message}</p>}
                        </div>

                        <div className="form-group">
                            <Label htmlFor="codigo" className="form-Label">
                                Código
                            </Label>
                            <Input type="text" id="codigo" className="form-Input" {...register("codigo")} />
                            {errors.codigo && <p className="form-error">{errors.codigo.message}</p>}
                        </div>

                        <div className="form-group">
                            <Label htmlFor="preco" className="form-Label">
                                Preço (R$)
                            </Label>
                            <Input type="number" id="preco" step="0.01" className="form-Input" {...register("preco")} />
                            {errors.preco && <p className="form-error">{errors.preco.message}</p>}
                        </div>

                        <div className="form-group">
                            <Label htmlFor="categoriaId" className="form-Label">
                                Categoria
                            </Label>
                            <Select {...register("categoriaId")} onValueChange={handleSelectChange} required>
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
                            {errors.categoriaId && <p className="form-error">{errors.categoriaId.message}</p>}
                        </div>

                        <div className="form-group">
                            <Label htmlFor="estoque" className="form-Label">
                                Estoque
                            </Label>
                            <Input type="number" id="estoque" className="form-Input" {...register("estoque")} />
                            {errors.estoque && <p className="form-error">{errors.estoque.message}</p>}
                        </div>

                        <div className="form-group">
                            <Label htmlFor="estoqueMinimo" className="form-Label">
                                Estoque Mínimo
                            </Label>
                            <Input type="number" id="estoqueMinimo" className="form-Input" {...register("estoqueMinimo")} />
                            {errors.estoqueMinimo && <p className="form-error">{errors.estoqueMinimo.message}</p>}
                        </div>

                        <div className="form-group md:col-span-2">
                            <Label htmlFor="fornecedor" className="form-Label">
                                Fornecedor
                            </Label>
                            <Input type="text" id="fornecedor" className="form-Input" {...register("fornecedor")} />
                            {errors.fornecedor && <p className="form-error">{errors.fornecedor.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 space-x-4">
                        <Link href="/produtos" className="btn btn-secondary">
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
                </form>
            </div>
        </div>
    )
}

