import { CATEGORIAS_MESSAGES } from "./types"
import { deleteCategoriaService } from "./delete-categoria.service"
import {
  categoriasDeleteSuccessResponse,
  categoriasErrorResponse,
} from "./responses"

export async function deleteCategoriaHandler(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const categoriaId = Number(id)
    const result = await deleteCategoriaService(categoriaId)

    if (!result.ok) {
      return categoriasErrorResponse(result.message, result.status)
    }

    return categoriasDeleteSuccessResponse(
      CATEGORIAS_MESSAGES.deleteSuccess,
      { id: result.id }
    )
  } catch (error) {
    console.error("Error en delete-categoria:", error)
    return categoriasErrorResponse(CATEGORIAS_MESSAGES.internalError, 500)
  }
}
