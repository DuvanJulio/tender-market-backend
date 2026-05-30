export type TProveedorPedidoEstado =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export type IProveedorDashboardKpis = {
  ventas_mes: number
  ventas_cambio_porcentaje: number | null
  pedidos_nuevos: number
  pedidos_nuevos_vs_ayer: number
  productos_activos: number
  productos_bajo_stock: number
  clientes_activos: number
  clientes_nuevos_mes: number
}

export type IProveedorPedidoReciente = {
  id: string
  customer: string
  items: number
  total: number
  status: TProveedorPedidoEstado
  occurred_at: string
}

export type IProveedorStockBajo = {
  id: number
  nombre: string
  stock: number
  min_stock: number
}

export type IProveedorTopProducto = {
  id: number
  nombre: string
  sales: number
  revenue: number
}

export type IGetProveedorDashboardData = {
  kpis: IProveedorDashboardKpis
  pedidos_recientes: IProveedorPedidoReciente[]
  stock_bajo: IProveedorStockBajo[]
  top_productos: IProveedorTopProducto[]
}

export type IGetProveedorDashboardResponse = {
  success: boolean
  message: string
  data?: IGetProveedorDashboardData
}
