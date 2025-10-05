import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Users, Package, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import { Pedido, Produto } from "@/@types"
import { getCookies } from "@/lib/getCookies"
import { filtrarPedidosDeOntemParaHoje } from "@/utils/filtrarPedidosDeOntemParaHoje"

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

const getPedidoAll = async (): Promise<Pedido[] | []> => {

    const token = await getCookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}pedido`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const dados = await response.json()
    //verificar se a request foi bem sucedida 
    if(!response.ok){
        return []
    }
    return dados

}

export default async function Dashboard() {

  const dados = await getProductsAll()
  const pedidos = await getPedidoAll()
  const pedidosFiltrados = filtrarPedidosDeOntemParaHoje(pedidos)

  const produtosEstoqueBaixo = dados.filter((itens) => itens.estoqueAtual <= 10)
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Hoje: {new Date().toLocaleDateString("pt-BR")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pedidos.length}</div>
            <p className="text-xs text-muted-foreground">{pedidosFiltrados.length <= 0 ? "" : "+" + pedidosFiltrados.length} desde ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">8 em campo, 4 no escritório</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos em Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtosEstoqueBaixo.length}</div>
            <p className="text-xs text-muted-foreground">Necessário reposição</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Ordens de Serviço Recentes</CardTitle>
            <CardDescription>Últimas 5 ordens de serviço registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 min-h-96">
              {pedidos.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">OS #{item.id}</p>
                    <p className="text-sm text-muted-foreground">Cliente: Empresa {item.cliente.nome}</p>
                  </div>
                  <Badge>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
            <CardDescription>Notificações importantes do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {produtosEstoqueBaixo.length >= 1 && (
                <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Estoque crítico</AlertTitle>
                <AlertDescription>{produtosEstoqueBaixo.length} produtos estão com estoque abaixo do mínimo</AlertDescription>
              </Alert>
              )}

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Ponto pendente</AlertTitle>
                <AlertDescription>2 funcionários não registraram ponto hoje</AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

