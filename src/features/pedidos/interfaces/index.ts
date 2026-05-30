export type TDbPedidoEstado =
  | "pendiente"
  | "procesando"
  | "enviado"
  | "entregado"
  | "cancelado"

export type TApiPedidoEstado =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export type IPedidoProductoItem = {
  name: string
  quantity: number
  price: number
}

export type IPedidoProveedor = {
  id: string
  customer: string
  customerPhone: string
  address: string
  items: number
  total: number
  status: TApiPedidoEstado
  occurred_at: string
  products: IPedidoProductoItem[]
}

export type IGetPedidosProveedorResponse = {
  success: boolean
  message: string
  data?: {
    pedidos: IPedidoProveedor[]
    pendientes_count: number
  }
}

export type IPatchPedidoEstadoBody = {
  estado: TApiPedidoEstado
}

export type IPatchPedidoEstadoResponse = {
  success: boolean
  message: string
  data?: IPedidoProveedor
}
