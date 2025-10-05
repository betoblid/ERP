export interface Cliente {
  id: number
  nome: string
}

export interface Funcionario {
  id: number
  nome: string
}

export interface OrdemServico {
  id: string
  titulo: string
  cliente: Cliente
  endereco: string
  dataAbertura: string | Date
  horario: string
  status: "aberta" | "andamento" | "finalizada"
  funcionario: Funcionario
  descricao?: string
  clienteId: number
  funcionarioId: number
}
