import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Users, Package, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"


export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
  <div className="flex items-center gap-2">
    <Badge variant="outline" className="text-sm">
      Hoje: {new Date().toLocaleDateString("pt-BR")}
    </Badge>
    <a
      href="/ordens-de-servico"
      className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
    >
      Criar Ordem de Serviço
    </a>
  </div>
  </div>
      

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+5 desde ontem</p>
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
            <div className="text-2xl font-bold">7</div>
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
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">OS #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">Cliente: Empresa {i}</p>
                  </div>
                  <Badge variant={i % 3 === 0 ? "destructive" : i % 2 === 0 ? "outline" : "default"}>
                    {i % 3 === 0 ? "Atrasada" : i % 2 === 0 ? "Em andamento" : "Concluída"}
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
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Estoque crítico</AlertTitle>
                <AlertDescription>3 produtos estão com estoque abaixo do mínimo</AlertDescription>
              </Alert>

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

