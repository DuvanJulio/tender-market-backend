import type { INotificacion } from "../interfaces"

type TRawNotificacion = {
  id: number
  tipo: string
  titulo: string
  mensaje: string
  pedido_codigo: string | null
  leida: boolean
  created_at: string
}

export function mapNotificacion(row: TRawNotificacion): INotificacion {
  return {
    id: row.id,
    tipo: row.tipo as INotificacion["tipo"],
    titulo: row.titulo,
    mensaje: row.mensaje,
    pedido_codigo: row.pedido_codigo,
    leida: row.leida,
    created_at: row.created_at,
  }
}

function isMissingTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return (
    error.code === "42P01" ||
    error.message?.includes("notificaciones") ||
    error.message?.includes("does not exist")
  )
}

export { isMissingTableError }
