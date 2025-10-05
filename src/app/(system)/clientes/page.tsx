import { Cliente } from "@/@types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Pencil, FileText } from "lucide-react"
import { cookies } from "next/headers"
import Link from "next/link"

const GetClientAll = async (): Promise<Cliente[]> => {
  const cookiesStore = await cookies()
  const token = cookiesStore.get("token")?.value
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}clientes`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const dados = response.json();
  return dados
}

export default async function ClientesPage() {

  const clients = await GetClientAll();
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
          {clients.length <= 0 && (<p className="text-lg font-bold">Não existe registro de clientes no momento..</p>)}
          {clients.length >= 1 && (
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
                { clients.map((cliente) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

