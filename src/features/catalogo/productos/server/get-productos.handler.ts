import { PRODUCTOS_MESSAGES } from "./types"
import { getProductosAdminService } from "./get-productos.service"
import {
  productosErrorResponse,
  productosGetSuccessResponse,
} from "./responses"

export async function getProductosAdminHandler() {
  try {
    const result = await getProductosAdminService()

    if (!result.ok) {
      return productosErrorResponse(result.message, result.status)
    }

    return productosGetSuccessResponse(
      PRODUCTOS_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-productos:", error)
    return productosErrorResponse(PRODUCTOS_MESSAGES.internalError, 500)
  }
}
