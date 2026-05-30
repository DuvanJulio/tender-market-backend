import { requireProveedorFromRequest } from "@/lib/auth/require-proveedor"
import { patchProductoProveedorService } from "./patch-producto-proveedor.service"
import {
  proveedorProductoSuccessResponse,
  proveedorProductosErrorResponse,
} from "./responses"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"
import { validatePatchProductoBody } from "./validate-producto-body"

export async function patchProductoProveedorHandler(
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
    const body = await request.json()
    const validation = await validatePatchProductoBody(body)

    if (!validation.ok) {
      return proveedorProductosErrorResponse(validation.message, validation.status)
    }

    const result = await patchProductoProveedorService(
      auth.context.proveedorId,
      productoId,
      validation.body
    )

    if (!result.ok) {
      return proveedorProductosErrorResponse(result.message, result.status)
    }

    return proveedorProductoSuccessResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.updateSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en patch-producto-proveedor:", error)
    return proveedorProductosErrorResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.internalError,
      500
    )
  }
}
