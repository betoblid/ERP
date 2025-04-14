import { Pedido } from "@/@types"
import { getCookies } from "@/lib/getCookies";


const getPedidoAll = async (): Promise<Pedido[] | []> => {

    const token = await getCookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}pedido`, {
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

export default async function ListaPedidosPage() {

    const pedidos = await getPedidoAll()
    return (
        <section className="p-6">
            <h1 className="text-2xl font-bold mb-4">Lista de Pedidos</h1>

            {pedidos.length === 0 ? (
                <p>Carregando pedidos...</p>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {pedidos.length >= 0 && pedidos.map(pedido => (
                        <div key={pedido.id} className="p-4 border rounded shadow-sm">
                            <h2 className="text-xl font-semibold">Pedido #{pedido.id}</h2>
                            <p>Status: <span className="font-medium">{pedido.status}</span></p>
                            <p>Data: {new Date(pedido.data).toLocaleDateString()} às {pedido.horario}</p>
                            <p>Endereço: {pedido.endereco}</p>

                            <div className="mt-2">
                                <h3 className="font-semibold">Cliente:</h3>
                                <p>{pedido.cliente.nome} - {pedido.cliente.documento}</p>
                                <p>{pedido.cliente.email} | {pedido.cliente.telefone}</p>
                            </div>

                            <div className="mt-2">
                                <h3 className="font-semibold">Itens:</h3>
                                <ul className="list-disc list-inside">
                                    {pedido.itens.map(item => (
                                        <li key={item.id}>
                                            {item.quantidade}x <strong>{item.produto.nome}</strong> - R$ {item.precoUnitario.toFixed(2)} (Fornecedor: {item.produto.fornecedor})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
