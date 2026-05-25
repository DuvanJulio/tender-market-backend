import type { TBaseResponse } from "@/types"

export interface IGetStatsResponseData {
  tenderos_activos: number
  proveedores_activos: number
}

export type IGetStatsResponse = TBaseResponse<IGetStatsResponseData>
