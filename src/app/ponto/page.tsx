"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, ArrowRight } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Tipos

type RegistroPonto = {
  id: number;
  tipo: "entrada" | "almoco_inicio" | "almoco_fim" | "saida";
  timestamp: Date;
  label: string;
};

type DiaPonto = {
  data: Date;
  registros: RegistroPonto[];
};

// Simulação de dados anteriores
const historicoSimulado: DiaPonto[] = [
  {
    data: new Date(new Date().setDate(new Date().getDate() - 1)),
    registros: [
      { id: 1, tipo: "entrada", timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), label: "Entrada" },
      { id: 2, tipo: "almoco_inicio", timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), label: "Início Almoço" },
      { id: 3, tipo: "almoco_fim", timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), label: "Fim Almoço" },
      { id: 4, tipo: "saida", timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), label: "Saída" },
    ],
  },
  {
    data: new Date(new Date().setDate(new Date().getDate() - 2)),
    registros: [
      { id: 5, tipo: "entrada", timestamp: new Date(new Date().setDate(new Date().getDate() - 2)), label: "Entrada" },
      { id: 6, tipo: "almoco_inicio", timestamp: new Date(new Date().setDate(new Date().getDate() - 2)), label: "Início Almoço" },
      { id: 7, tipo: "almoco_fim", timestamp: new Date(new Date().setDate(new Date().getDate() - 2)), label: "Fim Almoço" },
      { id: 8, tipo: "saida", timestamp: new Date(new Date().setDate(new Date().getDate() - 2)), label: "Saída" },
    ],
  },
];

export default function PontoPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [registrosHoje, setRegistrosHoje] = useState<RegistroPonto[]>([]);
  const [historico, setHistorico] = useState<DiaPonto[]>(historicoSimulado);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getNextRegistroTipo = (): RegistroPonto["tipo"] | null => {
    switch (registrosHoje.length) {
      case 0: return "entrada";
      case 1: return "almoco_inicio";
      case 2: return "almoco_fim";
      case 3: return "saida";
      default: return null;
    }
  };

  const registrarPonto = () => {
    const tipo = getNextRegistroTipo();
    if (!tipo) return;

    const labels: Record<RegistroPonto["tipo"], string> = {
      entrada: "Entrada",
      almoco_inicio: "Início Almoço",
      almoco_fim: "Fim Almoço",
      saida: "Saída",
    };

    const novoRegistro: RegistroPonto = {
      id: Date.now(),
      tipo,
      timestamp: new Date(),
      label: labels[tipo],
    };

    setRegistrosHoje([...registrosHoje, novoRegistro]);
  };

  const formatarData = (data: Date): string => {
    return data.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calcularHorasTrabalhadas = (registros: RegistroPonto[]): string => {
    if (registros.length < 4) return "Jornada incompleta";

    const entrada = registros.find(r => r.tipo === "entrada")?.timestamp;
    const almocoInicio = registros.find(r => r.tipo === "almoco_inicio")?.timestamp;
    const almocoFim = registros.find(r => r.tipo === "almoco_fim")?.timestamp;
    const saida = registros.find(r => r.tipo === "saida")?.timestamp;

    if (!entrada || !almocoInicio || !almocoFim || !saida) return "Dados incompletos";

    const msPrimeiroTurno = almocoInicio.getTime() - entrada.getTime();
    const msSegundoTurno = saida.getTime() - almocoFim.getTime();
    const msTotal = msPrimeiroTurno + msSegundoTurno;

    const horas = Math.floor(msTotal / 3600000);
    const minutos = Math.floor((msTotal % 3600000) / 60000);
    return `${horas}h ${minutos}min`;
  };

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
              {["entrada", "almoco_inicio", "almoco_fim", "saida"].map((tipo) => (
                <Button
                  key={tipo}
                  variant={getNextRegistroTipo() === tipo ? "default" : "outline"}
                  disabled={getNextRegistroTipo() !== tipo}
                  onClick={registrarPonto}
                  className="h-20"
                >
                  <div className="flex flex-col items-center">
                    <Clock className="h-6 w-6 mb-1" />
                    <span>{
                      tipo === "entrada"
                        ? "Entrada"
                        : tipo === "almoco_inicio"
                        ? "Início Almoço"
                        : tipo === "almoco_fim"
                        ? "Fim Almoço"
                        : "Saída"
                    }</span>
                  </div>
                </Button>
              ))}
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
                  .map((dia, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-medium">{formatarData(dia!.data)}</h3>
                      <div className="space-y-1">
                        {dia!.registros.map((registro) => (
                          <div key={registro.id} className="flex justify-between items-center p-2 border rounded-md">
                            <span>{registro.label}</span>
                            <span>{registro.timestamp.toLocaleTimeString("pt-BR")}</span>
                          </div>
                        ))}
                      </div>
                      {dia!.registros.length === 4 && (
                        <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                          <span className="font-medium">Total do dia:</span>
                          <span>{calcularHorasTrabalhadas(dia!.registros)}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </TabsContent>
              <TabsContent value="resumo" className="mt-4">
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
                      {[...historico, registrosHoje.length > 0 ? { data: new Date(), registros: registrosHoje } : null]
                        .filter(Boolean)
                        .map((dia, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{dia!.data.toLocaleDateString("pt-BR")}</td>
                            <td className="p-2 text-center">
                              {dia!.registros.find(r => r.tipo === "entrada")?.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) || "-"}
                            </td>
                            <td className="p-2 text-center">
                              {dia!.registros.find(r => r.tipo === "almoco_inicio")?.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) || "-"}
                              {dia!.registros.find(r => r.tipo === "almoco_fim") && (
                                <>
                                  <ArrowRight className="inline h-3 w-3 mx-1" />
                                  {dia!.registros.find(r => r.tipo === "almoco_fim")?.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {dia!.registros.find(r => r.tipo === "saida")?.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) || "-"}
                            </td>
                            <td className="p-2 text-right">
                              {dia!.registros.length === 4 ? calcularHorasTrabalhadas(dia!.registros) : "-"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}