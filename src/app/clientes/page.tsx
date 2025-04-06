import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Pencil, FileText } from "lucide-react"
import Link from "next/link"

// Dados simulados
const clientes = [
  {
    id: 1,
    nome: "Empresa ABC Ltda",
    documento: "12.345.678/0001-90",
    tipo: "CNPJ",
    endereco: "Av. Paulista, 1000, São Paulo - SP",
    telefone: "(11) 3333-4444",
    email: "contato@empresaabc.com",
  },
  {
    id: 2,
    nome: "João da Silva",
    documento: "123.456.789-00",
    tipo: "CPF",
    endereco: "Rua das Flores, 123, Rio de Janeiro - RJ",
    telefone: "(21) 98765-4321",
    email: "joao.silva@email.com",
  },
  {
    id: 3,
    nome: "Comércio XYZ",
    documento: "98.765.432/0001-10",
    tipo: "CNPJ",
    endereco: "Av. Brasil, 500, Belo Horizonte - MG",
    telefone: "(31) 2222-3333",
    email: "contato@comercioxyz.com",
  },
  {
    id: 4,
    nome: "Maria Oliveira",
    documento: "987.654.321-00",
    tipo: "CPF",
    endereco: "Rua dos Pinheiros, 50, Curitiba - PR",
    telefone: "(41) 97777-8888",
    email: "maria.oliveira@email.com",
  },
]

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <Link href="/clientes/cadastro">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Gerencie os clientes cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Documento</th>
                  <th className="text-left p-2">Telefone</th>
                  <th className="text-left p-2">E-mail</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{cliente.nome}</td>
                    <td className="p-2">{cliente.documento}</td>
                    <td className="p-2">{cliente.telefone}</td>
                    <td className="p-2">{cliente.email}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Link href={`/clientes/editar/${cliente.id}`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/clientes/${cliente.id}/ordens`}>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
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

