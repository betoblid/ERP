import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Pencil } from "lucide-react"
import Link from "next/link"

// Dados simulados
const produtos = [
  {
    id: 1,
    nome: "Cabo de Rede Cat6",
    codigo: "CB-CAT6-001",
    categoria: "Cabos",
    preco: 45.9,
    fornecedor: "NetCables",
    estoque: 120,
  },
  {
    id: 2,
    nome: "Roteador Wireless",
    codigo: "RT-WL-002",
    categoria: "Equipamentos",
    preco: 189.9,
    fornecedor: "TechNet",
    estoque: 8,
  },
  {
    id: 3,
    nome: "Switch 24 portas",
    codigo: "SW-24P-003",
    categoria: "Equipamentos",
    preco: 450.0,
    fornecedor: "NetPro",
    estoque: 15,
  },
  {
    id: 4,
    nome: "Conector RJ45",
    codigo: "CN-RJ45-004",
    categoria: "Conectores",
    preco: 0.9,
    fornecedor: "ConnectAll",
    estoque: 5,
  },
  {
    id: 5,
    nome: "Patch Panel 24p",
    codigo: "PP-24P-005",
    categoria: "Infraestrutura",
    preco: 220.0,
    fornecedor: "RackTech",
    estoque: 12,
  },
]

// Função para determinar se o estoque está baixo
const isLowStock = (quantity: number) => quantity <= 10

export default function ProdutosPage() {
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
                    <td className="p-2">{produto.codigo}</td>
                    <td className="p-2">{produto.categoria}</td>
                    <td className="p-2 text-right">R$ {produto.preco.toFixed(2)}</td>
                    <td className="p-2">{produto.fornecedor}</td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center">
                        {isLowStock(produto.estoque) ? (
                          <Badge variant="destructive">{produto.estoque}</Badge>
                        ) : (
                          <Badge variant="outline">{produto.estoque}</Badge>
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

