"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { usePedidoStore } from "./use-pedido-store"
import type { Pedido } from "@/@types"

interface PedidoInput {
  id?: string
  status: string
  data: string
  horario: string
  endereco: string
  observacao?: string
  clienteId: number
  itens: {
    quantidade: number
    precoUnitario: number
    produtoId: number
  }[]
}

interface AtualizacaoEntrega {
  status: string
  recebidoPor?: string
  localEntrega?: string
  horarioEntrega?: string
  observacao?: string
}

export function usePedidos() {
  const { setLoading, setPedidos, pedidos } = usePedidoStore()
  const [error, setError] = useState<string | null>(null)

  const fetchPedidos = async () => {
    setLoading(true)
    try {
      const response = await api.get("/pedido")
      const data = response.data
      setPedidos(data)
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao buscar pedidos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPedidos()
  }, [])

  const getPedidoPorId = async (id: string) => {
    try {
      const response = await api.get(`/pedido/${id}`)
      return response.data
    } catch (error: any) {
      setError(error.response?.data?.message || `Erro ao buscar pedido ${id}`)
      throw error
    }
  }

  const criarPedido = async (pedido: PedidoInput) => {
    try {
      setLoading(true)
      const response = await api.post("/pedido", pedido)
      await fetchPedidos()
      return response.data
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao criar pedido")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const atualizarPedido = async (id: string, pedido: Partial<PedidoInput>) => {
    try {
      setLoading(true)
      const response = await api.put(`/pedido/${id}`, pedido)
      await fetchPedidos()
      return response.data
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao atualizar pedido")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const atualizarEntrega = async (id: string, dados: AtualizacaoEntrega) => {
    try {
      setLoading(true)
      const response = await api.patch(`/pedido/${id}/status`, dados)
      await fetchPedidos()
      return response.data
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao atualizar status do pedido")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deletarPedido = async (id: string) => {
    try {
      setLoading(true)
      const response = await api.delete(`/pedido/${id}`)
      await fetchPedidos()
      return response.data
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao deletar pedido")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const filtrarPedidos = (
    pedidos: Pedido[] = [],
    filtros: {
      dataInicio?: Date | null
      dataFim?: Date | null
      clienteId?: number | null
      produtoId?: number | null
      busca?: string
      status?: string
    },
  ) => {
    return pedidos.filter((pedido: Pedido) => {
      if (filtros.dataInicio && new Date(pedido.data) < filtros.dataInicio) return false
      if (filtros.dataFim && new Date(pedido.data) > filtros.dataFim) return false
      if (filtros.clienteId && pedido.cliente.id !== filtros.clienteId) return false
      if (filtros.produtoId && !pedido.itens.some((item) => item.id === filtros.produtoId)) return false
      if (filtros.busca) {
        const termoBusca = filtros.busca.toLowerCase()
        const clienteNome = pedido.cliente?.nome.toLowerCase() || ""
        const produtosNomes = pedido.itens.map((item) => item.produto?.nome.toLowerCase() || "").join(" ")
        if (!clienteNome.includes(termoBusca) && !produtosNomes.includes(termoBusca)) return false
      }
      if (filtros.status && pedido.status !== filtros.status) return false
      return true
    })
  }

  return {
    pedidos,
    error,
    isLoading: pedidos === undefined,
    fetchPedidos,
    getPedidoPorId,
    criarPedido,
    atualizarPedido,
    atualizarEntrega,
    deletarPedido,
    filtrarPedidos,
    clearError: () => setError(null),
  }
}
