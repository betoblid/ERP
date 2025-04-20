import { Pedido } from "@/@types" // certifique-se que esse caminho está correto
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

interface FiltrosPedido {
  dataInicio?: Date | null
  dataFim?: Date | null
  clienteId?: number | null
  produtoId?: number | null
  busca?: string
  status?: string
}

interface PedidoStore {
  pedidos: Pedido[]
  pedidoSelecionado: Pedido | null
  filtros: FiltrosPedido
  isLoading: boolean

  setPedidos: (pedidos: Pedido[]) => void
  setPedidoSelecionado: (pedido: Pedido | null) => void
  adicionarPedido: (pedido: Pedido) => void
  atualizarPedido: (id: string, pedidoAtualizado: Partial<Pedido>) => void
  removerPedido: (id: string) => void

  setFiltros: (filtros: Partial<FiltrosPedido>) => void
  limparFiltros: () => void

  setLoading: (isLoading: boolean) => void
}

// ✅ Tipagem explícita aqui ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
export const usePedidoStore = create<PedidoStore>()(
  persist(
    devtools((set, get) => ({
      pedidos: [],
      pedidoSelecionado: null,
      filtros: {
        dataInicio: null,
        dataFim: null,
        clienteId: null,
        produtoId: null,
        busca: "",
        status: "",
      },
      isLoading: false,
      setPedidos: (pedidos) => set({ pedidos }),
      setPedidoSelecionado: (pedido) => set({ pedidoSelecionado: pedido }),
      adicionarPedido: (pedido) => set((state) => ({ pedidos: [...state.pedidos, pedido] })),
      atualizarPedido: (id, pedidoAtualizado) =>
        set((state) => ({
          pedidos: state.pedidos.map((pedido) =>
            pedido.id.toString() === id.toString() ? { ...pedido, ...pedidoAtualizado } : pedido,
          ),
          pedidoSelecionado:
            state.pedidoSelecionado?.id.toString() === id
              ? { ...state.pedidoSelecionado, ...pedidoAtualizado }
              : state.pedidoSelecionado,
        })),
      removerPedido: (id) =>
        set((state) => ({
          pedidos: state.pedidos.filter((pedido) => pedido.id.toString() !== id),
          pedidoSelecionado:
            state.pedidoSelecionado?.id.toString() === id ? null : state.pedidoSelecionado,
        })),
      setFiltros: (filtros) => set((state) => ({ filtros: { ...state.filtros, ...filtros } })),
      limparFiltros: () =>
        set({
          filtros: {
            dataInicio: null,
            dataFim: null,
            clienteId: null,
            produtoId: null,
            busca: "",
            status: "",
          },
        }),
      setLoading: (isLoading) => set({ isLoading }),
    })),
    {
      name: "pedido-store",
      partialize: (state) => ({
        filtros: state.filtros,
      }),
    },
  ),
)



// Seletores
export const usePedidosFiltrados = () => {
  const { pedidos, filtros } = usePedidoStore()

  return pedidos.filter((pedido) => {
    // Filtro por data
    if (filtros.dataInicio && new Date(pedido.data) < filtros.dataInicio) {
      return false
    }

    if (filtros.dataFim && new Date(pedido.data) > filtros.dataFim) {
      return false
    }

    // Filtro por cliente
    if (filtros.clienteId && pedido.cliente.id.toString() !== filtros.clienteId.toString()) {
      return false
    }

    // Filtro por produto
    if (filtros.produtoId && !pedido.itens.some((item) => item.id === filtros.produtoId as number)) {
      return false
    }

    // Filtro por busca
    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase()
      const clienteNome = pedido.cliente?.nome.toLowerCase() || ""
      const produtosNomes = pedido.itens.map((item) => item.produto?.nome.toLowerCase() || "").join(" ")

      if (!clienteNome.includes(termoBusca) && !produtosNomes.includes(termoBusca)) {
        return false
      }
    }

    // Filtro por status
    if (filtros.status && pedido.status !== filtros.status) {
      return false
    }

    return true
  })
}
