import type { TBaseResponse } from "@/types"

export interface ICityStatsItem {
  ciudad_id: number
  tenderos: number
  proveedores: number
}

export interface ITopCiudadStats {
  ciudad_id: number
  nombre: string
  usuarios: number
  pedidos: number
  ingresos: number
}

export interface IPendingApprovalItem {
  id: string
  nombre: string
  fecha_registro: string
  tipo: "tendero" | "proveedor"
}

export interface IRecentActivityItem {
  type: "user" | "order" | "supplier" | "product"
  action: string
  name: string
  occurred_at: string
}

export interface IGetStatsResponseData {
  tenderos_activos: number
  proveedores_activos: number
  por_ciudad: ICityStatsItem[]
  tenderos_nuevos_mes: number
  proveedores_nuevos_mes: number
  ingresos_totales: number
  ingresos_cambio_porcentaje: number | null
  pedidos_hoy: number
  pedidos_cambio_porcentaje: number | null
  aprobaciones_pendientes: IPendingApprovalItem[]
  actividad_reciente: IRecentActivityItem[]
  top_ciudades: ITopCiudadStats[]
}

export type IGetStatsResponse = TBaseResponse<IGetStatsResponseData>
