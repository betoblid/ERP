import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Pencil } from "lucide-react"
import Link from "next/link"

// Dados simulados
const funcionarios = [
  {
    id: 1,
    nome: "João Silva",
    cpf: "123.456.789-00",
    cargo: "Técnico",
    email: "joao@empresa.com",
    jornada: "08:00 às 17:00",
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    cpf: "987.654.321-00",
    cargo: "Supervisora",
    email: "maria@empresa.com",
    jornada: "09:00 às 18:00",
  },
  {
    id: 3,
    nome: "Pedro Santos",
    cpf: "456.789.123-00",
    cargo: "Técnico",
    email: "pedro@empresa.com",
    jornada: "08:00 às 17:00",
  },
  {
    id: 4,
    nome: "Ana Costa",
    cpf: "789.123.456-00",
    cargo: "Gerente",
    email: "ana@empresa.com",
    jornada: "08:00 às 18:00",
  },
]

export default function FuncionariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
        <Link href="/funcionarios/cadastro">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Funcionário
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>Gerencie os funcionários cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">CPF</th>
                  <th className="text-left p-2">Cargo</th>
                  <th className="text-left p-2">E-mail</th>
                  <th className="text-left p-2">Jornada</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((funcionario) => (
                  <tr key={funcionario.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{funcionario.nome}</td>
                    <td className="p-2">{funcionario.cpf}</td>
                    <td className="p-2">{funcionario.cargo}</td>
                    <td className="p-2">{funcionario.email}</td>
                    <td className="p-2">{funcionario.jornada}</td>
                    <td className="p-2">
                      <Link href={`/funcionarios/editar/${funcionario.id}`}>
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

