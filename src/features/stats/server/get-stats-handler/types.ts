import type { IGetStatsResponse } from "../../interfaces"

export type { IGetStatsResponse }

export const STATS_MESSAGES = {
  activeStatusNotFound: "No se encontró el estado activo",
  loadFailed: "Error al obtener estadísticas",
  success: "Estadísticas obtenidas exitosamente",
  internalError: "Error interno del servidor",
} as const
