"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Clock, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Tipo para registros de ponto
type RegistroPonto = {
  id: number
  tipo: "entrada" | "almoco_inicio" | "almoco_fim" | "saida"
  timestamp: Date
  label: string
}

// Tipo para dias de ponto
type DiaPonto = {
  data: Date
  registros: RegistroPonto[]
}

// Dados simulados
const historicoSimulado: DiaPonto[] = [
  {
    data: new Date(new Date().setDate(new Date().getDate() - 1)),
    registros: [
      {
        id: 1,
        tipo: "entrada",
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(8, 2),
        label: "Entrada",
      },
      {
        id: 2,
        tipo: "almoco_inicio",
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(12, 0),
        label: "Início Almoço",
      },
      {
        id: 3,
        tipo: "almoco_fim",
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(13, 5),
        label: "Fim Almoço",
      },
      {
        id: 4,
        tipo: "saida",
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(17, 3),
        label: "Saída",
      },
    ],
  },
  {
    data: new Date(new Date().setDate(new Date().getDate() - 2)),
    registros: [
      {
        id: 5,
        tipo: "entrada",
        timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(7, 55),
        label: "Entrada",
      },
      {
        id: 6,
        tipo: "almoco_inicio",
        timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(12, 0),
        label: "Início Almoço",
      },
      {
        id: 7,
        tipo: "almoco_fim",
        timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(13, 0),
        label: "Fim Almoço",
      },
      {
        id: 8,
        tipo: "saida",
        timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(17, 0),
        label: "Saída",
      },
    ],
  },
]

export default function PontoPage() {
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [registrosHoje, setRegistrosHoje] = useState<RegistroPonto[]>([])
  const [historico, setHistorico] = useState<DiaPonto[]>(historicoSimulado)

  // Atualiza o horário atual a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Próximo tipo de registro baseado nos registros existentes
  const getNextRegistroTipo = (): "entrada" | "almoco_inicio" | "almoco_fim" | "saida" | null => {
    if (registrosHoje.length === 0) return "entrada"
    if (registrosHoje.length === 1) return "almoco_inicio"
    if (registrosHoje.length === 2) return "almoco_fim"
    if (registrosHoje.length === 3) return "saida"
    return null
  }

  // Registrar ponto
  const registrarPonto = () => {
    const tipo = getNextRegistroTipo()

    if (!tipo) {
      toast({
        title: "Todos os registros já foram feitos",
        description: "Você já registrou todos os pontos para hoje",
        variant: "destructive",
      })
      return
    }

    const labels = {
      entrada: "Entrada",
      almoco_inicio: "Início Almoço",
      almoco_fim: "Fim Almoço",
      saida: "Saída",
    }

    const novoRegistro: RegistroPonto = {
      id: Date.now(),
      tipo,
      timestamp: new Date(),
      label: labels[tipo],
    }

    setRegistrosHoje([...registrosHoje, novoRegistro])

    toast({
      title: "Ponto registrado com sucesso!",
      description: `${labels[tipo]} registrado às ${novoRegistro.timestamp.toLocaleTimeString("pt-BR")}`,
    })
  }

  // Formatar data
  const formatarData = (data: Date): string => {
    return data.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calcular horas trabalhadas
  const calcularHorasTrabalhadas = (registros: RegistroPonto[]): string => {
    if (registros.length < 4) return "Jornada incompleta"

    const entrada = registros.find((r) => r.tipo === "entrada")?.timestamp
    const almocoInicio = registros.find((r) => r.tipo === "almoco_inicio")?.timestamp
    const almocoFim = registros.find((r) => r.tipo === "almoco_fim")?.timestamp
    const saida = registros.find((r) => r.tipo === "saida")?.timestamp

    if (!entrada || !almocoInicio || !almocoFim || !saida) return "Dados incompletos"

    const msPrimeiroTurno = almocoInicio.getTime() - entrada.getTime()
    const msSegundoTurno = saida.getTime() - almocoFim.getTime()
    const msTotalTrabalhado = msPrimeiroTurno + msSegundoTurno

    const horas = Math.floor(msTotalTrabalhado / (1000 * 60 * 60))
    const minutos = Math.floor((msTotalTrabalhado % (1000 * 60 * 60)) / (1000 * 60))

    return `${horas}h ${minutos}min`
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Registro de Ponto</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Ponto</CardTitle>
            <CardDescription>Registre sua entrada, almoço e saída</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 border rounded-md">
              <div className="text-4xl font-bold mb-2">{currentTime.toLocaleTimeString("pt-BR")}</div>
              <div className="text-muted-foreground">{formatarData(currentTime)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={getNextRegistroTipo() === "entrada" ? "default" : "outline"}
                disabled={getNextRegistroTipo() !== "entrada"}
                onClick={registrarPonto}
                className="h-20"
              >
                <div className="flex flex-col items-center">
                  <Clock className="h-6 w-6 mb-1" />
                  <span>Entrada</span>
                </div>
              </Button>

              <Button
                variant={getNextRegistroTipo() === "almoco_inicio" ? "default" : "outline"}
                disabled={getNextRegistroTipo() !== "almoco_inicio"}
                onClick={registrarPonto}
                className="h-20"
              >
                <div className="flex flex-col items-center">
                  <Clock className="h-6 w-6 mb-1" />
                  <span>Início Almoço</span>
                </div>
              </Button>

              <Button
                variant={getNextRegistroTipo() === "almoco_fim" ? "default" : "outline"}
                disabled={getNextRegistroTipo() !== "almoco_fim"}
                onClick={registrarPonto}
                className="h-20"
              >
                <div className="flex flex-col items-center">
                  <Clock className="h-6 w-6 mb-1" />
                  <span>Fim Almoço</span>
                </div>
              </Button>

              <Button
                variant={getNextRegistroTipo() === "saida" ? "default" : "outline"}
                disabled={getNextRegistroTipo() !== "saida"}
                onClick={registrarPonto}
                className="h-20"
              >
                <div className="flex flex-col items-center">
                  <Clock className="h-6 w-6 mb-1" />
                  <span>Saída</span>
                </div>
              </Button>
            </div>

            {registrosHoje.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="font-medium">Registros de Hoje:</h3>
                <div className="space-y-2">
                  {registrosHoje.map((registro) => (
                    <div key={registro.id} className="flex justify-between items-center p-2 border rounded-md">
                      <span>{registro.label}</span>
                      <span>{registro.timestamp.toLocaleTimeString("pt-BR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Espelho de Ponto</CardTitle>
            <CardDescription>Visualize seu histórico de registros</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="historico">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="historico">Histórico</TabsTrigger>
                <TabsTrigger value="resumo">Resumo</TabsTrigger>
              </TabsList>
              <TabsContent value="historico" className="space-y-4 mt-4">
                {[...historico, registrosHoje.length > 0 ? { data: new Date(), registros: registrosHoje } : null]
                  .filter(Boolean)
                  .map(
                    (dia, index) =>
                      dia && (
                        <div key={index} className="space-y-2">
                          <h3 className="font-medium">{formatarData(dia.data)}</h3>
                          <div className="space-y-1">
                            {dia.registros.map((registro) => (
                              <div
                                key={registro.id}
                                className="flex justify-between items-center p-2 border rounded-md"
                              >
                                <span>{registro.label}</span>
                                <span>{registro.timestamp.toLocaleTimeString("pt-BR")}</span>
                              </div>
                            ))}
                          </div>
                          {dia.registros.length === 4 && (
                            <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                              <span className="font-medium">Total do dia:</span>
                              <span>{calcularHorasTrabalhadas(dia.registros)}</span>
                            </div>
                          )}
                        </div>
                      ),
                  )}
              </TabsContent>
              <TabsContent value="resumo" className="mt-4">
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Data</th>
                          <th className="text-center p-2">Entrada</th>
                          <th className="text-center p-2">Almoço</th>
                          <th className="text-center p-2">Saída</th>
                          <th className="text-right p-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ...historico,
                          registrosHoje.length > 0 ? { data: new Date(), registros: registrosHoje } : null,
                        ]
                          .filter(Boolean)
                          .map(
                            (dia, index) =>
                              dia && (
                                <tr key={index} className="border-b">
                                  <td className="p-2">{dia.data.toLocaleDateString("pt-BR")}</td>
                                  <td className="p-2 text-center">
                                    {dia.registros
                                      .find((r) => r.tipo === "entrada")
                                      ?.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ||
                                      "-"}
                                  </td>
                                  <td className="p-2 text-center">
                                    {dia.registros
                                      .find((r) => r.tipo === "almoco_inicio")
                                      ?.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ||
                                      "-"}{" "}
                                    {dia.registros.find((r) => r.tipo === "almoco_inicio") &&
                                      dia.registros.find((r) => r.tipo === "almoco_fim") && (
                                        <ArrowRight className="inline h-3 w-3" />
                                      )}{" "}
                                    {dia.registros
                                      .find((r) => r.tipo === "almoco_fim")
                                      ?.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ||
                                      "-"}
                                  </td>
                                  <td className="p-2 text-center">
                                    {dia.registros
                                      .find((r) => r.tipo === "saida")
                                      ?.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ||
                                      "-"}
                                  </td>
                                  <td className="p-2 text-right">
                                    {dia.registros.length === 4 ? calcularHorasTrabalhadas(dia.registros) : "-"}
                                  </td>
                                </tr>
                              ),
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Este código é um exemplo de uma página de registro de ponto em um aplicativo React. Ele utiliza componentes de UI personalizados para criar um layout responsivo e interativo. Os dados são simulados para fins de demonstração, e a lógica de registro de ponto é implementada com base nos registros existentes. A página também inclui um histórico de registros e um resumo das horas trabalhadas.
// O código é modular e pode ser facilmente adaptado para integrar com uma API real ou um banco de dados, se necessário. Além disso, ele utiliza hooks do React para gerenciar o estado e efeitos colaterais, como a atualização do horário atual a cada segundo.