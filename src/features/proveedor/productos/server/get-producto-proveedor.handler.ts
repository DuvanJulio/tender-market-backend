import { requireProveedorFromRequest } from "@/lib/auth/require-proveedor"
import { getProductoProveedorService } from "./get-producto-proveedor.service"
import {
  proveedorProductoSuccessResponse,
  proveedorProductosErrorResponse,
} from "./responses"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"

export async function getProductoProveedorHandler(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireProveedorFromRequest(request)
    if (!auth.ok) {
      return proveedorProductosErrorResponse(auth.message, auth.status)
    }

    const { id } = await context.params
    const productoId = Number(id)
    const result = await getProductoProveedorService(
      auth.context.proveedorId,
      productoId
    )

    if (!result.ok) {
      return proveedorProductosErrorResponse(result.message, result.status)
    }

    return proveedorProductoSuccessResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-producto-proveedor:", error)
    return proveedorProductosErrorResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.internalError,
      500
    )
  }
}
