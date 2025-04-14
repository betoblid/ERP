"use client"

import { useEffect, useState } from "react"
import { FiClock, FiAlertCircle } from "react-icons/fi"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import api from "@/lib/api"
import { getUser } from "@/lib/auth"
import type { Ponto, User } from "@/@types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type TipoPonto = "entrada" | "almoco_inicio" | "almoco_fim" | "saida"

export default function RegistroPonto() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [registrosHoje, setRegistrosHoje] = useState<Ponto[]>([])
  const [historico, setHistorico] = useState<Ponto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    const userData = getUser()
    if (userData) {
      setUser(userData)
      if (!userData.funcionarioId) {
        toast.error("Você não está vinculado a um funcionário. Contate o administrador.")
        return
      }

      fetchPontos(userData.funcionarioId)
    }

    // Update current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const fetchPontos = async (funcionarioId: number) => {
    try {
      const response = await api.get(`/funcionario/ponto/${funcionarioId}`)
      const pontos = response.data

      // Filtrar registros do dia
      const today = new Date().toISOString().split("T")[0]
      const pontosHoje = pontos.filter((ponto: Ponto) => ponto.timestamp.startsWith(today))

      setRegistrosHoje(pontosHoje)
      setHistorico(pontos)
    } catch (error) {
      console.error("Error fetching pontos:", error)
      toast.error("Erro ao buscar registros de ponto")
    } finally {
      setIsLoading(false)
    }
  }

  const getNextRegistroTipo = (): TipoPonto | null => {
    const tiposRegistrados = registrosHoje.map((r) => r.tipo)

    if (!tiposRegistrados.includes("entrada")) return "entrada"
    if (!tiposRegistrados.includes("almoco_inicio")) return "almoco_inicio"
    if (!tiposRegistrados.includes("almoco_fim")) return "almoco_fim"
    if (!tiposRegistrados.includes("saida")) return "saida"

    return null
  }

  const getTipoLabel = (tipo: TipoPonto): string => {
    const labels: Record<TipoPonto, string> = {
      entrada: "Entrada",
      almoco_inicio: "Início do Almoço",
      almoco_fim: "Fim do Almoço",
      saida: "Saída",
    }
    return labels[tipo]
  }

  const registrarPonto = async () => {
    if (!user?.funcionarioId) {
      toast.error("Você não está vinculado a um funcionário")
      return
    }

    const tipo = getNextRegistroTipo()
    if (!tipo) {
      toast.error("Todos os registros já foram feitos hoje")
      return
    }

    setIsRegistering(true)
    try {
      const response = await api.post("/funcionario/ponto", {
        tipo,
        funcionarioId: user.funcionarioId,
      })

      toast.success(`${getTipoLabel(tipo)} registrado com sucesso!`)

      // Refresh pontos
      fetchPontos(user.funcionarioId)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao registrar ponto")
    } finally {
      setIsRegistering(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user?.funcionarioId) {
    return (
      <div className="card text-center py-8">
        <FiAlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Usuário não vinculado</h2>
        <p className="text-gray-600 mb-4">
          Seu usuário não está vinculado a nenhum funcionário. Entre em contato com o administrador.
        </p>
        <button onClick={() => router.push("/")} className="btn btn-primary">
          Voltar para o Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Registro de Ponto</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Registrar Ponto</h2>
          <div className="text-center p-4 border rounded-md mb-6">
            <div className="text-4xl font-bold mb-2 text-gray-800">{format(currentTime, "HH:mm:ss")}</div>
            <div className="text-gray-800">{format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              className={`btn ${getNextRegistroTipo() === "entrada" ? "btn-primary" : "btn-secondary"} h-20 flex flex-col items-center justify-center`}
              disabled={getNextRegistroTipo() !== "entrada" || isRegistering}
              onClick={registrarPonto}
            >
              <FiClock className="h-6 w-6 mb-1" />
              <span>Entrada</span>
            </button>

            <button
              className={`btn ${getNextRegistroTipo() === "almoco_inicio" ? "btn-primary" : "btn-secondary"} h-20 flex flex-col items-center justify-center`}
              disabled={getNextRegistroTipo() !== "almoco_inicio" || isRegistering}
              onClick={registrarPonto}
            >
              <FiClock className="h-6 w-6 mb-1" />
              <span>Início Almoço</span>
            </button>

            <button
              className={`btn ${getNextRegistroTipo() === "almoco_fim" ? "btn-primary" : "btn-secondary"} h-20 flex flex-col items-center justify-center`}
              disabled={getNextRegistroTipo() !== "almoco_fim" || isRegistering}
              onClick={registrarPonto}
            >
              <FiClock className="h-6 w-6 mb-1" />
              <span>Fim Almoço</span>
            </button>

            <button
              className={`btn ${getNextRegistroTipo() === "saida" ? "btn-primary" : "btn-secondary"} h-20 flex flex-col items-center justify-center`}
              disabled={getNextRegistroTipo() !== "saida" || isRegistering}
              onClick={registrarPonto}
            >
              <FiClock className="h-6 w-6 mb-1" />
              <span>Saída</span>
            </button>
          </div>

          {registrosHoje.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Registros de Hoje:</h3>
              <div className="space-y-2">
                {registrosHoje.map((registro) => (
                  <div key={registro.id} className="flex justify-between items-center p-2 border rounded-md">
                    <span>{getTipoLabel(registro.tipo as TipoPonto)}</span>
                    <span>{format(new Date(registro.timestamp), "HH:mm:ss")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Histórico de Registros</h2>

          {historico.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum registro encontrado</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Data</th>
                    <th className="table-header-cell">Hora</th>
                    <th className="table-header-cell">Tipo</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {historico.map((registro) => (
                    <tr key={registro.id} className="table-row">
                      <td className="table-cell">{format(new Date(registro.timestamp), "dd/MM/yyyy")}</td>
                      <td className="table-cell">{format(new Date(registro.timestamp), "HH:mm:ss")}</td>
                      <td className="table-cell">
                        <span
                          className={`badge ${registro.tipo === "entrada"
                            ? "badge-success"
                            : registro.tipo === "saida"
                              ? "badge-danger"
                              : "badge-info"
                            }`}
                        >
                          {getTipoLabel(registro.tipo as TipoPonto)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

