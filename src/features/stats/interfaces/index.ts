import type { TBaseResponse } from "@/types"

export interface ICityStatsItem {
  ciudad_id: number
  tenderos: number
  proveedores: number
}

export interface IGetStatsResponseData {
  tenderos_activos: number
  proveedores_activos: number
  por_ciudad: ICityStatsItem[]
}

export type IGetStatsResponse = TBaseResponse<IGetStatsResponseData>
