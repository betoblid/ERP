import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Pencil } from "lucide-react"
import Link from "next/link"
import { getCookies } from "@/lib/getCookies"
import { Produto } from "@/@types"

//Pegar todos os Produtos
const getProductsAll = async (): Promise<Produto[]> => {

  const token = await getCookies()
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}produto`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const dados = await response.json()
  return dados
}

// Função para determinar se o estoque está baixo
const isLowStock = (quantity: number) => quantity <= 10


export default async function ProdutosPage() {

  const produtos = await getProductsAll()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <Link href="/produtos/cadastro">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>Gerencie os produtos cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Código</th>
                  <th className="text-left p-2">Categoria</th>
                  <th className="text-right p-2">Preço</th>
                  <th className="text-left p-2">Fornecedor</th>
                  <th className="text-center p-2">Estoque</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => (
                  <tr key={produto.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{produto.nome}</td>
                    <td className="p-2">{produto.codigoBarras}</td>
                    <td className="p-2">{produto.categoria.nome}</td>
                    <td className="p-2 text-right">R$ {produto.preco}</td>
                    <td className="p-2">{produto.fornecedor}</td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center">
                        {isLowStock(produto.estoqueAtual) ? (
                          <Badge variant="destructive">{produto.estoqueAtual}</Badge>
                        ) : (
                          <Badge variant="outline">{produto.estoqueAtual}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <Link href={`/produtos/editar/${produto.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

