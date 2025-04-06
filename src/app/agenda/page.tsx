"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User } from "lucide-react"

// Tipo para eventos da agenda
type Evento = {
  id: string
  titulo: string
  cliente: string
  endereco: string
  data: Date
  horario: string
  status: "agendada" | "em_andamento" | "concluida" | "cancelada"
  tecnico: string
}

// Dados simulados
const eventos: Evento[] = [
  {
    id: "OS-2023-001",
    titulo: "Instalação de Rede",
    cliente: "Empresa ABC",
    endereco: "Av. Paulista, 1000, São Paulo - SP",
    data: new Date(2023, 5, 15),
    horario: "09:00",
    status: "concluida",
    tecnico: "João Silva",
  },
  {
    id: "OS-2023-002",
    titulo: "Manutenção de Servidor",
    cliente: "Comércio XYZ",
    endereco: "Av. Brasil, 500, Belo Horizonte - MG",
    data: new Date(2023, 5, 16),
    horario: "14:00",
    status: "em_andamento",
    tecnico: "Maria Oliveira",
  },
  {
    id: "OS-2023-003",
    titulo: "Instalação de Câmeras",
    cliente: "João da Silva",
    endereco: "Rua das Flores, 123, Rio de Janeiro - RJ",
    data: new Date(2023, 5, 17),
    horario: "10:30",
    status: "agendada",
    tecnico: "Pedro Santos",
  },
  {
    id: "OS-2023-004",
    titulo: "Configuração de Firewall",
    cliente: "Empresa DEF",
    endereco: "Rua Augusta, 500, São Paulo - SP",
    data: new Date(2023, 5, 18),
    horario: "11:00",
    status: "agendada",
    tecnico: "Ana Costa",
  },
  {
    id: "OS-2023-005",
    titulo: "Suporte Técnico",
    cliente: "Loja GHI",
    endereco: "Av. Amazonas, 100, Belo Horizonte - MG",
    data: new Date(2023, 5, 15),
    horario: "15:30",
    status: "cancelada",
    tecnico: "João Silva",
  },
]

// Componente para exibir o status
const StatusBadge = ({ status }: { status: Evento["status"] }) => {
  const statusConfig = {
    agendada: { label: "Agendada", variant: "outline" as const },
    em_andamento: { label: "Em Andamento", variant: "default" as const },
    concluida: { label: "Concluída", variant: "secondary" as const },
    cancelada: { label: "Cancelada", variant: "destructive" as const },
  }

  const config = statusConfig[status]

  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<"dia" | "semana" | "mes">("semana")

  // Filtrar eventos pela data selecionada
  const filteredEventos = selectedDate
    ? eventos.filter(
        (evento) =>
          evento.data.getDate() === selectedDate.getDate() &&
          evento.data.getMonth() === selectedDate.getMonth() &&
          evento.data.getFullYear() === selectedDate.getFullYear(),
      )
    : eventos

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <div className="flex space-x-2">
          <Button variant={view === "dia" ? "default" : "outline"} onClick={() => setView("dia")}>
            Dia
          </Button>
          <Button variant={view === "semana" ? "default" : "outline"} onClick={() => setView("semana")}>
            Semana
          </Button>
          <Button variant={view === "mes" ? "default" : "outline"} onClick={() => setView("mes")}>
            Mês
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Selecione uma data para ver os eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 border rounded-md mb-4">
              {/* Placeholder para o calendário - em uma implementação real, usaríamos um componente de calendário como o FullCalendar */}
              <div className="font-bold">Junho 2023</div>
              <div className="grid grid-cols-7 gap-1 mt-2">
                <div className="text-xs text-muted-foreground">Dom</div>
                <div className="text-xs text-muted-foreground">Seg</div>
                <div className="text-xs text-muted-foreground">Ter</div>
                <div className="text-xs text-muted-foreground">Qua</div>
                <div className="text-xs text-muted-foreground">Qui</div>
                <div className="text-xs text-muted-foreground">Sex</div>
                <div className="text-xs text-muted-foreground">Sáb</div>

                {/* Dias do mês */}
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className={`
                      p-1 text-sm rounded-full cursor-pointer hover:bg-muted
                      ${selectedDate?.getDate() === i + 1 ? "bg-primary text-primary-foreground" : ""}
                      ${eventos.some((e) => e.data.getDate() === i + 1) ? "font-bold" : ""}
                    `}
                    onClick={() => setSelectedDate(new Date(2023, 5, i + 1))}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Legenda:</h3>
              <div className="space-y-1">
                <div className="flex items-center">
                  <StatusBadge status="agendada" />
                  <span className="ml-2 text-sm">Agendada</span>
                </div>
                <div className="flex items-center">
                  <StatusBadge status="em_andamento" />
                  <span className="ml-2 text-sm">Em Andamento</span>
                </div>
                <div className="flex items-center">
                  <StatusBadge status="concluida" />
                  <span className="ml-2 text-sm">Concluída</span>
                </div>
                <div className="flex items-center">
                  <StatusBadge status="cancelada" />
                  <span className="ml-2 text-sm">Cancelada</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? selectedDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Todos os Eventos"}
            </CardTitle>
            <CardDescription>
              {selectedDate
                ? `${filteredEventos.length} evento(s) para esta data`
                : `${filteredEventos.length} evento(s) no total`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEventos.length === 0 ? (
                <div className="text-center p-4 border rounded-md">
                  <p className="text-muted-foreground">Nenhum evento encontrado</p>
                </div>
              ) : (
                filteredEventos.map((evento) => (
                  <div key={evento.id} className="p-4 border rounded-md hover:bg-muted/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{evento.titulo}</h3>
                        <p className="text-sm text-muted-foreground">{evento.id}</p>
                      </div>
                      <StatusBadge status={evento.status} />
                    </div>

                    <div className="space-y-1 mt-2">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{evento.cliente}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{evento.endereco}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{evento.data.toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{evento.horario}</span>
                      </div>
                      <div className="flex items-center text-sm mt-2">
                        <span className="font-medium">Técnico:</span>
                        <span className="ml-2">{evento.tecnico}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

