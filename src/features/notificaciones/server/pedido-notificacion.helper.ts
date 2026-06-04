import type { TApiPedidoEstado } from "@/features/pedidos/interfaces"
import {
  createNotificacionService,
  getUsuarioIdFromProveedorId,
  getUsuarioIdFromTenderoId,
} from "./create-notificacion.service"

export async function notifyProveedorNuevoPedido(params: {
  proveedorId: number
  pedidoCodigo: string
  nombreTienda: string
}) {
  const usuarioId = await getUsuarioIdFromProveedorId(params.proveedorId)
  if (!usuarioId) return

  await createNotificacionService({
    usuario_id: usuarioId,
    tipo: "pedido_nuevo",
    titulo: `Nuevo pedido ${params.pedidoCodigo}`,
    mensaje: `${params.nombreTienda} realizó un pedido`,
    pedido_codigo: params.pedidoCodigo,
  })
}

export async function notifyProveedorPedidoCancelado(params: {
  proveedorId: number
  pedidoCodigo: string
  nombreTienda: string
}) {
  const usuarioId = await getUsuarioIdFromProveedorId(params.proveedorId)
  if (!usuarioId) return

  await createNotificacionService({
    usuario_id: usuarioId,
    tipo: "pedido_cancelado",
    titulo: `Pedido cancelado ${params.pedidoCodigo}`,
    mensaje: `${params.nombreTienda} canceló el pedido`,
    pedido_codigo: params.pedidoCodigo,
  })
}

export async function notifyTenderoPedidoEstado(params: {
  tenderoId: number
  pedidoCodigo: string
  estado: TApiPedidoEstado
  proveedorNombre: string
}) {
  const usuarioId = await getUsuarioIdFromTenderoId(params.tenderoId)
  if (!usuarioId) return

  const config = getTenderoNotificacionConfig(
    params.estado,
    params.pedidoCodigo,
    params.proveedorNombre
  )

  if (!config) return

  await createNotificacionService({
    usuario_id: usuarioId,
    tipo: config.tipo,
    titulo: config.titulo,
    mensaje: config.mensaje,
    pedido_codigo: params.pedidoCodigo,
  })
}

function getTenderoNotificacionConfig(
  estado: TApiPedidoEstado,
  codigo: string,
  proveedor: string
) {
  switch (estado) {
    case "processing":
      return {
        tipo: "pedido_confirmado" as const,
        titulo: `Pedido confirmado ${codigo}`,
        mensaje: `${proveedor} confirmó tu pedido`,
      }
    case "shipped":
      return {
        tipo: "pedido_enviado" as const,
        titulo: `Pedido en camino ${codigo}`,
        mensaje: `${proveedor} marcó tu pedido como enviado`,
      }
    case "delivered":
      return {
        tipo: "pedido_entregado" as const,
        titulo: `Pedido entregado ${codigo}`,
        mensaje: `Tu pedido ${codigo} fue entregado`,
      }
    case "cancelled":
      return {
        tipo: "pedido_cancelado" as const,
        titulo: `Pedido cancelado ${codigo}`,
        mensaje: `${proveedor} canceló tu pedido`,
      }
    default:
      return null
  }
}
