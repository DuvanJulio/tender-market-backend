export type TNotificacionTipo =
  | "pedido_nuevo"
  | "pedido_confirmado"
  | "pedido_enviado"
  | "pedido_entregado"
  | "pedido_cancelado"
  | "usuario_pendiente"
  | "producto_pendiente"

export type INotificacion = {
  id: number
  tipo: TNotificacionTipo
  titulo: string
  mensaje: string
  pedido_codigo: string | null
  leida: boolean
  created_at: string
}

export type IGetNotificacionesResponse = {
  success: boolean
  message: string
  data?: {
    notificaciones: INotificacion[]
    no_leidas: number
  }
}

export type IPatchNotificacionLeidaResponse = {
  success: boolean
  message: string
  data?: {
    no_leidas: number
  }
}

export type ICreateNotificacionInput = {
  usuario_id: string
  tipo: TNotificacionTipo
  titulo: string
  mensaje: string
  pedido_codigo?: string | null
}
