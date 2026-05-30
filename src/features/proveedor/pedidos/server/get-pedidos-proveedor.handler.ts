import { requireProveedorFromRequest } from "@/lib/auth/require-proveedor"
import type { TApiPedidoEstado } from "@/features/pedidos/interfaces"
import { getPedidosProveedorService } from "./get-pedidos-proveedor.service"
import {
  proveedorPedidosErrorResponse,
  proveedorPedidosListSuccessResponse,
} from "./responses"
import { PROVEEDOR_PEDIDOS_MESSAGES } from "./types"

function parseEstado(
  param: string | null
): TApiPedidoEstado | undefined {
  if (
    param === "pending" ||
    param === "processing" ||
    param === "shipped" ||
    param === "delivered" ||
    param === "cancelled"
  ) {
    return param
  }
  return undefined
}

export async function getPedidosProveedorHandler(request: Request) {
  try {
    const auth = await requireProveedorFromRequest(request)
    if (!auth.ok) {
      return proveedorPedidosErrorResponse(auth.message, auth.status)
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || undefined
    const estado = parseEstado(searchParams.get("estado"))

    const result = await getPedidosProveedorService({
      proveedorId: auth.context.proveedorId,
      search,
      estado,
    })

    if (!result.ok) {
      return proveedorPedidosErrorResponse(result.message, result.status)
    }

    return proveedorPedidosListSuccessResponse(
      PROVEEDOR_PEDIDOS_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-pedidos-proveedor:", error)
    return proveedorPedidosErrorResponse(
      PROVEEDOR_PEDIDOS_MESSAGES.internalError,
      500
    )
  }
}
