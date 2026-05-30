import { requireProveedorFromRequest } from "@/lib/auth/require-proveedor"
import { postProductoProveedorService } from "./post-producto-proveedor.service"
import {
  proveedorProductoSuccessResponse,
  proveedorProductosErrorResponse,
} from "./responses"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"
import { validatePostProductoBody } from "./validate-producto-body"

export async function postProductoProveedorHandler(request: Request) {
  try {
    const auth = await requireProveedorFromRequest(request)
    if (!auth.ok) {
      return proveedorProductosErrorResponse(auth.message, auth.status)
    }

    const body = await request.json()
    const validation = await validatePostProductoBody(body)

    if (!validation.ok) {
      return proveedorProductosErrorResponse(validation.message, validation.status)
    }

    const result = await postProductoProveedorService(
      auth.context.proveedorId,
      validation.body
    )

    if (!result.ok) {
      return proveedorProductosErrorResponse(result.message, result.status)
    }

    return proveedorProductoSuccessResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.createSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en post-producto-proveedor:", error)
    return proveedorProductosErrorResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.internalError,
      500
    )
  }
}
