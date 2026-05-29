import { CATEGORIAS_MESSAGES } from "./types"
import { getCategoriasService } from "./get-categorias.service"
import {
  categoriasErrorResponse,
  categoriasGetSuccessResponse,
} from "./responses"

export async function getCategoriasHandler() {
  try {
    const result = await getCategoriasService()

    if (!result.ok) {
      return categoriasErrorResponse(result.message, result.status)
    }

    return categoriasGetSuccessResponse(
      CATEGORIAS_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-categorias:", error)
    return categoriasErrorResponse(CATEGORIAS_MESSAGES.internalError, 500)
  }
}
