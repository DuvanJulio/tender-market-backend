import { requireProveedorFromRequest } from "@/lib/auth/require-proveedor"
import type { TApiPedidoEstado } from "@/features/pedidos/interfaces"
import { patchPedidoEstadoService } from "./patch-pedido-estado.service"
import {
  proveedorPedidoPatchSuccessResponse,
  proveedorPedidosErrorResponse,
} from "./responses"
import { PROVEEDOR_PEDIDOS_MESSAGES } from "./types"

function parseBodyEstado(raw: unknown): TApiPedidoEstado | null {
  if (!raw || typeof raw !== "object") return null
  const estado = (raw as { estado?: unknown }).estado
  if (
    estado === "pending" ||
    estado === "processing" ||
    estado === "shipped" ||
    estado === "delivered" ||
    estado === "cancelled"
  ) {
    return estado
  }
  return null
}

export async function patchPedidoEstadoHandler(
  request: Request,
  context: { params: Promise<{ codigo: string }> }
) {
  try {
    const auth = await requireProveedorFromRequest(request)
    if (!auth.ok) {
      return proveedorPedidosErrorResponse(auth.message, auth.status)
    }

    const { codigo } = await context.params
    const decodedCodigo = decodeURIComponent(codigo)
    const body = await request.json()
    const estado = parseBodyEstado(body)

    if (!estado) {
      return proveedorPedidosErrorResponse(
        PROVEEDOR_PEDIDOS_MESSAGES.invalidEstado,
        400
      )
    }

    const result = await patchPedidoEstadoService(
      auth.context.proveedorId,
      decodedCodigo,
      estado
    )

    if (!result.ok) {
      return proveedorPedidosErrorResponse(result.message, result.status)
    }

    return proveedorPedidoPatchSuccessResponse(
      PROVEEDOR_PEDIDOS_MESSAGES.updateSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en patch-pedido-estado:", error)
    return proveedorPedidosErrorResponse(
      PROVEEDOR_PEDIDOS_MESSAGES.internalError,
      500
    )
  }
}
