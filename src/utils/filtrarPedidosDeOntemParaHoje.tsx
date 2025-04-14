import { Pedido } from "@/@types"

export function filtrarPedidosDeOntemParaHoje(pedidos: Pedido[]): Pedido[] {
    const agora = new Date()
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
  
    return pedidos.filter(pedido => {
      const dataPedido = new Date(pedido.data)
      return dataPedido >= ontem && dataPedido <= agora
    })
  }