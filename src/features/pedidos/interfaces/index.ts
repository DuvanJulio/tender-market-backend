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
  producto_id?: number | null
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

export type IPedidoTendero = {
  id: string
  supplier: string
  supplierPhone: string
  address: string
  contact: string
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

export type IGetPedidosTenderoResponse = {
  success: boolean
  message: string
  data?: {
    pedidos: IPedidoTendero[]
    activos_count: number
  }
}

export type IPostPedidoTenderoBody = {
  items: { producto_id: number; quantity: number }[]
}

export type IPostPedidoTenderoResponse = {
  success: boolean
  message: string
  data?: {
    pedidos: IPedidoTendero[]
  }
}

export type IPatchCancelarPedidoTenderoResponse = {
  success: boolean
  message: string
  data?: IPedidoTendero
}

export type IGetCheckoutTenderoResponse = {
  success: boolean
  message: string
  data?: {
    direccion: string
    contacto: string
    telefono: string
    nombre_tienda: string
  }
}

export type IPatchPedidoEstadoBody = {
  estado: TApiPedidoEstado
}

export type IPatchPedidoEstadoResponse = {
  success: boolean
  message: string
  data?: IPedidoProveedor
  /** Enlace wa.me para que el proveedor avise al tendero (confirmación, envío, etc.) */
  whatsapp_url?: string | null
}
