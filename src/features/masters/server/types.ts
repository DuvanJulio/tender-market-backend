import type { IGetCitiesResponse } from "../interfaces"

export type { IGetCitiesResponse }

export const MASTERS_MESSAGES = {
  citiesLoadFailed: "No se pudieron cargar las ciudades",
  citiesLoadSuccess: "Ciudades cargadas",
  internalError: "Error interno del servidor",
} as const
