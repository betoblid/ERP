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

  export interface OrdemServico {
    id: string
    titulo: string
    cliente: {
      id: number
      nome: string
    }
    localExecucao: string
    dataAbertura: Date
    dataAgendado: Date
    horarioExecucao: string
    status: "aberta" | "andamento" | "finalizada"
    funcionario: {
      id: number
      nome: string
    }
    descricao?: string
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
  
  export interface Ocorrencia {
    id: number;
    tipo: "entrega" | "retirada"; // restrito aos dois tipos conhecidos
    recebidoPor: string;
    data: string; // ISO date string
    horario: string; // "HH:mm"
    local: string;
    observacao?: string; // campo opcional
    status: "finalizado" | "pendente" | string; // pode adicionar outros status se houver
    pedidoId: number;
    funcionarioId: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  }
  
  
  export interface Pedido {
    id: number
    status: "agendado" | "em_andamento" | "concluido" | "cancelado"
    data: string
    horario: string
    endereco: string
    cliente: {
      id: number
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
    ocorrencias: Ocorrencia[]
  }