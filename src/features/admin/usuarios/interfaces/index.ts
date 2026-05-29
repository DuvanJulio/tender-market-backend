export type TUsuarioRolAdmin = "tendero" | "proveedor"

/** Estados visibles en el panel admin (bloqueado en BD se normaliza a inactivo). */
export type TUsuarioEstadoAdmin = "activo" | "pendiente" | "inactivo"

export type IUsuarioAdmin = {
  id: string
  nombre: string
  nombre_pila: string
  apellido: string | null
  email: string | null
  telefono: string | null
  rol: TUsuarioRolAdmin
  negocio: string
  ciudad: string | null
  estado: TUsuarioEstadoAdmin
  pedidos: number
  total_gastado: number
  fecha_registro: string
}

export type TPatchUsuarioBody = {
  nombre?: string
  apellido?: string
  telefono?: string
  negocio?: string
}

export type TPatchUsuarioEstadoBody = {
  estado: "activo" | "inactivo"
}

export type IPatchUsuarioResponse = {
  success: boolean
  message: string
  data?: IUsuarioAdmin
}

export type IPatchUsuarioEstadoResponse = {
  success: boolean
  message: string
  data?: { id: string; estado: TUsuarioEstadoAdmin }
}

export type IDeleteUsuarioResponse = {
  success: boolean
  message: string
  data?: { id: string }
}

export type IUsuarioAdminDetalle = IUsuarioAdmin & {
  fecha_actualizacion: string
  ultimo_acceso: string | null
  nit: string | null
  nombre_tienda: string | null
  nombre_empresa: string | null
  nombre_contacto: string | null
  telefono_negocio: string | null
  direccion: string | null
  barrio: string | null
  departamento: string | null
}

export type IGetUsuarioResponse = {
  success: boolean
  message: string
  data?: IUsuarioAdminDetalle
}

export type IGetUsuariosAdminResponse = {
  success: boolean
  message: string
  data?: IUsuarioAdmin[]
}
