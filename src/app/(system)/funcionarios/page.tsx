import { Funcionario } from "@/@types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { getCookies } from "@/lib/getCookies"
import { PlusCircle, Pencil } from "lucide-react"
import Link from "next/link"

//Pegar todos os funcionários
const getEmployeesAll = async (): Promise<Funcionario[]> => {

  const token = await getCookies()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}funcionario`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const dados = await response.json()
  return dados
}

export default async function FuncionariosPage() {

  const dados = await getEmployeesAll()

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
          {dados.length <= 0 && (<div>
            <p>Não a funcionários cadastrados no momento...</p>
          </div>)}

          {dados.length >= 1 && (<div className="overflow-x-auto">
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
                {dados.map((funcionario) => (
                  <tr key={funcionario.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{funcionario.nome}</td>
                    <td className="p-2">{funcionario.cpf}</td>
                    <td className="p-2">{funcionario.cargo}</td>
                    <td className="p-2">{funcionario.email}</td>
                    <td className="p-2">{funcionario.jornadaInicio} ás {funcionario.jornadaFim}</td>
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
          </div>)}
        </CardContent>
      </Card>
    </div>
  )
}

