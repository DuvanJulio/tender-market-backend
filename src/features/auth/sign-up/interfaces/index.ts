export type TSignUpRole = "tendero" | "proveedor"

export type TSignUpStep = 1 | 2 | 3

/** @deprecated Usar ICityOption desde @/features/masters */
export type { ICityOption as ICiudadOption } from "@/features/masters"

export interface ISignUpRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  telefono: string
  rol: TSignUpRole
  ciudad_id: number
  direccion: string
  barrio: string
  nombre_tienda?: string
  nit_tienda?: string
  nombre_empresa?: string
  nit_empresa?: string
  nombre_contacto?: string
}

export interface ISignUpResponseData {
  rol: TSignUpRole
  token?: string
}

export interface ISignUpResponse {
  success: boolean
  message: string
  data?: ISignUpResponseData
}
