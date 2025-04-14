"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { date } from "zod";

type Cliente = {
  id: string;
  nome: string;
};

type Produto = {
  id: string;
  nome: string;
};

export default function CriarOrdemDeServico() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [pontoRetirada, setPontoRetirada] = useState("estoque");
  const [quantidade, setQuantidade] = useState(1);
  

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get("/clientes"); // ajuste a rota
        setClientes(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    const fetchProdutos = async () => {
      try {
        const response = await api.get("/produto"); // ajuste a rota
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchClientes();
    fetchProdutos();
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ordem = {
      clienteId,
      produtoId,
      pontoRetirada,
      quantidade,
    };

    // Faça o POST aqui se quiser
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nova Ordem de Serviço</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        

        {/* Cliente */}
        <div>
          <Label htmlFor="clientId" className="block font-medium mb-1">Cliente</Label>
          <select
            value={clienteId}
            id="clientId"
            name="clientId"
            onChange={(e) => setClienteId(e.target.value)}
            className="bg-white text-black inline-block border border-gray-300 rounded px-2 py-1 w-full"
            required
            
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Produto */}
        <div>
          <Label htmlFor="productId" className="block font-medium mb-1">Produto</Label>
          <select
            value={produtoId}
            id="productId"
            name="productId"
            onChange={(e) => setProdutoId(e.target.value)}
            className="bg-white text-black inline-block border border-gray-300 rounded px-2 py-1 w-full"
            required
          >
            <option value="">Selecione um produto</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Ponto de Retirada */}
        <div>
          <Label className="block font-medium mb-1">Ponto de Retirada</Label>
          <div className="flex gap-4">
            <Label className="flex items-center gap-2">
              <Input
                type="radio"
                value="estoque"
                checked={pontoRetirada === "estoque"}
                onChange={(e) => setPontoRetirada(e.target.value)}
              />
              Estoque Próprio
            </Label>
            <Label className="flex items-center gap-2">
              <input
                type="radio"
                value="fornecedor"
                checked={pontoRetirada === "fornecedor"}
                onChange={(e) => setPontoRetirada(e.target.value)}
              />
              Fornecedor
            </Label>
          </div>
        </div>

        {/* Quantidade */}
        <div>
          <Label className="block font-medium mb-1">Quantidade</Label>
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
