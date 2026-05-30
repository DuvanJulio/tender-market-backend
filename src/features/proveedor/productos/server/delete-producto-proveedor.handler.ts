import { requireProveedorFromRequest } from "@/lib/auth/require-proveedor"
import { deleteProductoProveedorService } from "./delete-producto-proveedor.service"
import {
  proveedorProductoDeleteSuccessResponse,
  proveedorProductosErrorResponse,
} from "./responses"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"

export async function deleteProductoProveedorHandler(
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
    const result = await deleteProductoProveedorService(
      auth.context.proveedorId,
      productoId
    )

    if (!result.ok) {
      return proveedorProductosErrorResponse(result.message, result.status)
    }

    return proveedorProductoDeleteSuccessResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.deleteSuccess,
      { id: result.id }
    )
  } catch (error) {
    console.error("Error en delete-producto-proveedor:", error)
    return proveedorProductosErrorResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.internalError,
      500
    )
  }
}
