"use client";

import { useState } from "react";


const clientes = ["Cliente A", "Cliente B", "Cliente C"];
const produtos = ["Produto X", "Produto Y", "Produto Z"];

export default function CriarOrdemDeServico() {
  const [cliente, setCliente] = useState("");
  const [produto, setProduto] = useState("");
  const [pontoRetirada, setPontoRetirada] = useState("estoque");
  const [quantidade, setQuantidade] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ordem = {
      cliente,
      produto,
      pontoRetirada,
      quantidade,
    };

    console.log("Ordem de Serviço criada:", ordem);
    // Aqui você pode enviar para uma API com fetch/axios
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nova Ordem de Serviço</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Cliente</label>
          <select
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Produto</label>
          <select
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          >
            <option value="">Selecione um produto</option>
            {produtos.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Ponto de Retirada</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="estoque"
                checked={pontoRetirada === "estoque"}
                onChange={(e) => setPontoRetirada(e.target.value)}
              />
              Estoque Próprio
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="fornecedor"
                checked={pontoRetirada === "fornecedor"}
                onChange={(e) => setPontoRetirada(e.target.value)}
              />
              Fornecedor
            </label>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Quantidade</label>
          <input
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Salvar Ordem de Serviço
          </button>
        </div>
      </form>
    </div>
  );
}
