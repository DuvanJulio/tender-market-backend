import { PRODUCTOS_MESSAGES } from "./types"
import { deleteProductoService } from "./delete-producto.service"
import {
  productosDeleteSuccessResponse,
  productosErrorResponse,
} from "./responses"

export async function deleteProductoHandler(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const productoId = Number(id)
    const result = await deleteProductoService(productoId)

    if (!result.ok) {
      return productosErrorResponse(result.message, result.status)
    }

    return productosDeleteSuccessResponse(
      PRODUCTOS_MESSAGES.deleteSuccess,
      { id: result.id }
    )
  } catch (error) {
    console.error("Error en delete-producto:", error)
    return productosErrorResponse(PRODUCTOS_MESSAGES.internalError, 500)
  }
}
