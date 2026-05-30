import type { TApiPedidoEstado, TDbPedidoEstado } from "../interfaces"

const API_TO_DB: Record<TApiPedidoEstado, TDbPedidoEstado> = {
  pending: "pendiente",
  processing: "procesando",
  shipped: "enviado",
  delivered: "entregado",
  cancelled: "cancelado",
}

const DB_TO_API: Record<TDbPedidoEstado, TApiPedidoEstado> = {
  pendiente: "pending",
  procesando: "processing",
  enviado: "shipped",
  entregado: "delivered",
  cancelado: "cancelled",
}

const ALLOWED_TRANSITIONS: Record<TDbPedidoEstado, TDbPedidoEstado[]> = {
  pendiente: ["procesando", "cancelado"],
  procesando: ["enviado"],
  enviado: ["entregado"],
  entregado: [],
  cancelado: [],
}

export function toDbEstado(estado: TApiPedidoEstado): TDbPedidoEstado {
  return API_TO_DB[estado]
}

export function toApiEstado(estado: string): TApiPedidoEstado | null {
  if (estado in DB_TO_API) {
    return DB_TO_API[estado as TDbPedidoEstado]
  }
  return null
}

export function isValidTransition(
  current: TDbPedidoEstado,
  next: TDbPedidoEstado
): boolean {
  return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false
}

export const ESTADOS_VENTA: TDbPedidoEstado[] = [
  "procesando",
  "enviado",
  "entregado",
]
