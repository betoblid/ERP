export type Funcionario = {
    id: number
    nome: string
    cpf: string
    email: string
    cargo: string
    jornadaInicio: string
    jornadaFim: string
}

export interface User {
    id: number
    username: string
    email: string
    role: "admin" | "gerente" | "usuario"
    ativo: boolean
    funcionarioId: number | null
    funcionario?: Funcionario
  }
  
  export interface Funcionario {
    id: number
    nome: string
    cpf: string
    cargo: string
    email: string
    jornadaInicio: string
    jornadaFim: string
  }
  
  export interface Produto {
    id: number
    nome: string
    codigoBarras: string
    preco: number
    estoqueAtual: number
    estoqueMinimo: number
    fornecedor: string
    categoriaId: number
    categoria: Categoria
  }
  
  export interface Categoria {
    id: number
    nome: string
  }
  
  export interface Cliente {
    id: number
    nome: string
    tipoDocumento: string
    documento: string
    endereco: string
    telefone: string
    email: string
  }
  
  export interface Ponto {
    id: number
    tipo: "entrada" | "almoco_inicio" | "almoco_fim" | "saida"
    timestamp: string
    funcionarioId: number
  }
  
  export interface AuthResponse {
    token: string
    user: User
  }
  
  
  export interface Pedido {
    id: number
    status: "agendado" | "em_andamento" | "concluido" | "cancelado"
    data: string
    horario: string
    endereco: string
    cliente: {
      nome: string
      documento: string
      telefone: string
      email: string
    }
    itens: {
      id: number
      quantidade: number
      precoUnitario: number
      produto: {
        nome: string
        fornecedor: string
      }
    }[]
  }