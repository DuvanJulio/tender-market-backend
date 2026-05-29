import type { TPatchProductoEstadoBody } from "../interfaces"
import { PRODUCTOS_MESSAGES } from "./types"
import { patchProductoEstadoService } from "./patch-producto-estado.service"
import {
  productosErrorResponse,
  productosPatchSuccessResponse,
} from "./responses"

export async function patchProductoEstadoHandler(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const productoId = Number(id)
    const body = (await request.json()) as TPatchProductoEstadoBody
    const result = await patchProductoEstadoService(productoId, body)

    if (!result.ok) {
      return productosErrorResponse(result.message, result.status)
    }

    return productosPatchSuccessResponse(
      PRODUCTOS_MESSAGES.updateSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en patch-producto-estado:", error)
    return productosErrorResponse(PRODUCTOS_MESSAGES.internalError, 500)
  }
}
