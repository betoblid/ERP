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
  preco: number
  estoque: number
  estoqueAtual: number
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
  quickbooksId?: string
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
  entityType: "cliente" | "produto" | "pedido"
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
  isConfigured: boolean
  createdAt: Date
  updatedAt: Date
}
