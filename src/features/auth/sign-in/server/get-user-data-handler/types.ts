import type { IGetUserDataResponse } from "../../interfaces"

export type { IGetUserDataResponse }

export interface IUsuarioBasicProfile {
  nombre: string | null
  apellido: string | null
  roles: { nombre: string } | null
}

export const GET_USER_DATA_MESSAGES = {
  success: "Datos de usuario obtenidos",
  internalError: "Error interno del servidor",
} as const
