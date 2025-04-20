import { Suspense } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { NovaOrdemServicoDialog } from "@/components/nova-ordem-servico-dialog"
import { CalendarioLateral } from "@/components/calendario-lateral"
import { OrdemServicoList } from "@/components/ordem-servico-list"
import { ButtonRefresh } from "@/components/button-refresh"

export default function AgendaPage() {
  const hoje = new Date()
  const dataFormatada = format(hoje, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda de Serviços</h1>
          <p className="text-muted-foreground">{dataFormatada}</p>
        </div>
        <div>

        </div>
        <div className="flex items-center space-x-2">
          <NovaOrdemServicoDialog />
          < ButtonRefresh />
        </div>
      </div>

      <Tabs defaultValue="dia" className="mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="dia">Dia</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="mes">Mês</TabsTrigger>

          </TabsList>
          <div className="mt-4 flex items-center space-x-2 md:mt-0">
            <DatePickerWithRange className="w-full md:w-auto" />
            <Button variant="outline" size="icon">
              <FilterIcon className="h-4 w-4" />
              <span className="sr-only">Filtrar</span>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 xl:flex-row md:gap-6">
          {/* Calendário Lateral */}
          <Card className="max-w-96 mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2" />
                Calendário
              </CardTitle>
              <CardDescription>Selecione uma data</CardDescription>
            </CardHeader>
            <CardContent className="">
              <CalendarioLateral />
            </CardContent>
          </Card>

          {/* Conteúdo Principal */}
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Ordens de Serviço</CardTitle>
                <CardDescription>Visualize e gerencie as ordens de serviço</CardDescription>
              </CardHeader>
              <CardContent>
               

                <TabsContent value="dia" className="mt-4">
                  <Suspense fallback={<OrdensServicoSkeleton />}>
                    <OrdemServicoList />
                  </Suspense>
                </TabsContent>

                <TabsContent value="semana">
                  <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">Visualização semanal em desenvolvimento</p>
                  </div>
                </TabsContent>

                <TabsContent value="mes">
                  <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">Visualização mensal em desenvolvimento</p>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

function OrdensServicoSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
          <div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-8 w-[100px]" />
        </div>
      ))}
    </div>
  )
}
