"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import api from "@/lib/api"
import type { Categoria, Produto } from "@/@types"
import { toast } from "sonner"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { FiSave } from "react-icons/fi"

// Schema de validação
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

export default function EditarProdutoPage() {
    const router = useRouter()
    const params = useParams()
    const produtoId = params.id as string

    const [listCategory, setListCategory] = useState<Categoria[]>([])
    const [isSaving, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [produto, setProduto] = useState<Produto | null>(null)

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

    // Carregar dados do produto
    useEffect(() => {
        if (produtoId) {
            Promise.all([api.get<Produto>(`/produto/${produtoId}`), api.get<Categoria[]>("/categoria")])
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
    }, [produtoId, reset, router])

    const handleSelectChange = (value: string) => {
        setValue("categoriaId", Number(value))
    }

    const onSubmit = async (values: ProdutoFormData) => {
        setIsSubmitting(true)

        try {
            await api.put(`/produto/${produtoId}`, values)

            toast(`O produto ${values.nome} foi atualizado.`)

            router.push("/produtos")
        } catch (error) {
            console.error("Erro ao atualizar produto:", error)
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
                    <p className="mt-2 text-sm text-muted-foreground">Carregando dados do produto...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6">
            <PageHeader
                title={`Editar Produto: ${produto?.nome}`}
                description="Atualize as informações do produto"
                breadcrumbs={[{ label: "Produtos", href: "/produtos" }, { label: `Editar Produto` }]}
                actions={
                    <Button variant="outline" onClick={() => router.push("/produtos")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                }
            />

            <div className="bg-slate-900 text-white shadow-md rounded-lg p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <Label htmlFor="nome" >
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
