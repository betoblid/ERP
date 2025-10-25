export interface Cliente {
  id: number
  nome: string
  email: string
  telefone: string
  endereco: string
  documento: string
  tipoDocumento: "cpf" | "cnpj"
  quickbooksId?: string
  syncedAt?: Date
  syncStatus?: "pending" | "synced" | "error"
  createdAt: Date
  updatedAt: Date
}

export interface Produto {
  id: number
  nome: string
  codigo: string
  descricao?: string
  preco: number
  estoqueAtual: number
  estoqueMinimo: number
  categoriaId: number
  categoria: Categoria
  quickbooksId?: string
  syncedAt?: Date
  syncStatus?: "pending" | "synced" | "error"
  createdAt: Date
  updatedAt: Date
}

export interface Categoria {
  id: number
  nome: string
  descricao?: string
}

export interface Motorista {
  id: number
  primeiroNome: string
  nomeCompleto: string
  celular: string
  operadora?: string
  cpf: string
  email: string
  dataNascimento: Date
  rg: string
  orgaoEmissor: string
  ufEmissor: string
  municipioNasc: string
  dataEmissaoRg: Date
  telefone?: string
  nomeMae: string
  nomePai: string
  pis?: string
  pais: string
  sexo: "masculino" | "feminino" | "outro"
  cep: string
  endereco: string
  bairro: string
  cidade: string
  numero: string
  complemento?: string
  resideDesdeMes: number
  resideDesdeAno: number
  numeroHabilitacao: string
  cidadeCnh: string
  categoriaCnh: string
  dataEmissaoCnh: Date
  validadeCnh: Date
  dataPrimeiraCnh: Date
  codSegurancaCnh: string
  anexoCnh?: string
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Veiculo {
  id: number
  placa: string
  renavam: string
  marca: string
  modelo: string
  anoFabricacao: number
  anoModelo: number
  cor: string
  dataCompra: Date
  baseOperacao: string
  tipoVeiculo: "vuc" | "van" | "iveco" | "fiorino" | "moto" | "hr" | "1/4" | "toco" | "truck"
  categoriaFrota: string
  seguradora?: string
  vigencia?: Date
  taraVeiculo?: number
  capacidadeCarga?: number
  capacidadeCargaM3?: number
  tipoCarroceria?: string
  ufEmplacada: string
  tipoRodado?: string
  certificadoCronotacografo?: string
  medidasRodado?: string
  consumoKmLitro?: number
  kmMaximoRota?: number
  capacidadeTanque?: number
  tipoResponsavel?: string
  unidadeProprietaria?: string
  financiamento?: string
  instituicaoFinanceira?: string
  tabela?: string
  valorEntrega?: number
  valorKmRodado?: number
  valorDiaria?: number
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Pedido {
  id: number
  numero: string
  clienteId: number
  cliente: Cliente
  data: string
  horario: string
  endereco: string
  observacao?: string
  status: "agendado" | "em_andamento" | "concluido" | "cancelado" | "entregue" | "retirado"
  itens: PedidoItem[]
  entrega?: Entrega
  quickbooksId?: string
  estimateId?: number
  syncedAt?: Date
  syncStatus?: "pending" | "synced" | "error"
  createdAt: Date
  updatedAt: Date
}

export interface PedidoItem {
  id: string
  pedidoId: number
  produtoId: number
  produto?: Produto
  quantidade: number
  precoUnitario: number
  createdAt: Date
  updatedAt: Date
}

export interface Entrega {
  id: number
  pedidoId: number
  pedido?: Pedido
  estimateId?: number
  quickbooksInvoiceId?: string
  dataEntrega: string
  horarioEntrega: string
  motoristaId: number
  motorista?: Motorista
  veiculoId: number
  veiculo?: Veiculo
  status: "agendada" | "em_rota" | "entregue" | "cancelada"
  observacoes?: string
  nomeRecebedor?: string
  identidadeRecebedor?: string
  dataRecebimento?: Date
  fotoComprovante?: string
  createdAt: Date
  updatedAt: Date
}

export interface QuickBooksToken {
  access_token: string
  refresh_token: string
  expires_in: number
  x_refresh_token_expires_in: number
  token_type: string
  realmId: string
}

export interface QuickBooksCustomer {
  Id: string
  DisplayName: string
  PrimaryEmailAddr?: {
    Address: string
  }
  PrimaryPhone?: {
    FreeFormNumber: string
  }
  BillAddr?: {
    Line1: string
  }
  CompanyName?: string
  GivenName?: string
  FamilyName?: string
  SyncToken: string
  Active: boolean
  MetaData: {
    CreateTime: string
    LastUpdatedTime: string
  }
}

export interface QuickBooksItem {
  Id: string
  Name: string
  Description?: string
  Type: string
  UnitPrice: number
  QtyOnHand: number
  TrackQtyOnHand: boolean
  IncomeAccountRef: {
    value: string
    name: string
  }
  AssetAccountRef?: {
    value: string
    name: string
  }
  ExpenseAccountRef?: {
    value: string
    name: string
  }
  SyncToken: string
  Active: boolean
  MetaData: {
    CreateTime: string
    LastUpdatedTime: string
  }
}

export interface QuickBooksInvoice {
  Id: string
  DocNumber: string
  TxnDate: string
  DueDate: string
  CustomerRef: {
    value: string
    name: string
  }
  Line: Array<{
    Amount: number
    DetailType: string
    Description?: string
    LineNum: number
    SalesItemLineDetail?: {
      ItemRef: {
        value: string
        name: string
      }
      Qty: number
      UnitPrice: number
      TaxCodeRef: {
        value: string
      }
    }
  }>
  BillAddr?: {
    Line1: string
  }
  CustomerMemo?: {
    value: string
  }
  TotalAmt: number
  Balance: number
  SyncToken: string
  MetaData: {
    CreateTime: string
    LastUpdatedTime: string
  }
}

export interface SyncLog {
  id: number
  entityType: "cliente" | "produto" | "pedido" | "estimate"
  entityId: number
  action: "create" | "update" | "delete"
  status: "pending" | "success" | "error"
  quickbooksId?: string
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
}

export interface QuickBooksConfig {
  id: number
  realmId: string
  accessToken: string
  refreshToken: string
  expiresAt: Date
  refreshTokenExpiresAt: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
