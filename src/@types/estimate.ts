export interface EstimateLine {
  Id?: string
  LineNum?: number
  Description?: string
  Amount: number
  DetailType: "SalesItemLineDetail" | "SubTotalLineDetail" | "DiscountLineDetail"
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
  SubTotalLineDetail?: {}
  DiscountLineDetail?: {
    DiscountAccountRef?: {
      name: string
      value: string
    }
    PercentBased: boolean
    DiscountPercent?: number
  }
}

export interface EstimateAddress {
  Id?: string
  Line1?: string
  Line2?: string
  Line3?: string
  City?: string
  CountrySubDivisionCode?: string
  PostalCode?: string
  Lat?: string
  Long?: string
}

export interface Estimate {
  Id?: string
  DocNumber?: string
  TxnDate: string
  ExpirationDate?: string
  AcceptedDate?: string
  TxnStatus?: "Pending" | "Accepted" | "Closed" | "Rejected"
  CustomerRef: {
    value: string
    name: string
  }
  BillEmail?: {
    Address: string
  }
  BillAddr?: EstimateAddress
  ShipAddr?: EstimateAddress
  Line: EstimateLine[]
  TotalAmt: number
  CustomerMemo?: {
    value: string
  }
  PrivateNote?: string
  PrintStatus?: "NeedToPrint" | "PrintComplete"
  EmailStatus?: "NotSet" | "NeedToSend" | "EmailSent"
  TxnTaxDetail: {
    TotalTax: number
    TxnTaxCodeRef?: {
      value: string
    }
    TaxLine?: Array<{
      Amount: number
      DetailType: "TaxLineDetail"
      TaxLineDetail: {
        TaxRateRef: {
          value: string
        }
        PercentBased: boolean
        TaxPercent: number
        NetAmountTaxable: number
      }
    }>
  }
  ApplyTaxAfterDiscount: boolean
  CustomField?: Array<{
    DefinitionId: string
    Name: string
    Type: string
    StringValue?: string
  }>
  SyncToken?: string
  sparse?: boolean
  MetaData?: {
    CreateTime: string
    LastUpdatedTime: string
  }
  ProjectRef?: {
    value: string
  }
  LinkedTxn?: Array<{
    TxnId: string
    TxnType: string
  }>
}

export interface EstimateListItem {
  Id: string
  DocNumber: string
  TxnDate: string
  CustomerRef: {
    value: string
    name: string
  }
  TotalAmt: number
  TxnStatus: string
  EmailStatus: string
  ExpirationDate?: string
}

export interface EstimateFormData {
  customerId: string
  customerEmail?: string
  txnDate: string
  expirationDate?: string
  acceptedDate?: string
  billAddr?: Partial<EstimateAddress>
  shipAddr?: Partial<EstimateAddress>
  items: Array<{
    productId: string
    description?: string
    quantity: number
    unitPrice: number
    taxCode: string
  }>
  discountPercent: number
  discountAccountId?: string
  customerMemo?: string
  privateNote?: string
  taxCodeId?: string
  applyTaxAfterDiscount: boolean
}

export type TipoVeiculo = "vuc" | "van" | "iveco" | "fiorino" | "moto" | "hr" | "1/4" | "toco" | "truck"

export interface ConversaoFaturaData {
  estimateId: string
  dataEntrega: string
  horarioEntrega: string
  tipoVeiculo: TipoVeiculo
  placaVeiculo: string
  nomeMotorista: string
  identidadeMotorista: string
  observacoes?: string
}

export interface Entrega {
  id: number
  faturaId: number
  estimateId?: string
  quickbooksInvoiceId?: string
  dataEntrega: string
  horarioEntrega: string
  tipoVeiculo: TipoVeiculo
  placaVeiculo: string
  nomeMotorista: string
  identidadeMotorista: string
  status: "agendada" | "em_rota" | "entregue" | "cancelada"
  observacoes?: string
  nomeRecebedor?: string
  identidadeRecebedor?: string
  dataRecebimento?: Date
  fotoComprovante?: string
  createdAt: Date
  updatedAt: Date
}
