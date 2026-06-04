import type { TPatchCategoriaBody } from "../interfaces"
import { patchCategoriaService } from "./patch-categoria.service"
import {
  categoriasErrorResponse,
  categoriasPatchSuccessResponse,
} from "./responses"
import { CATEGORIAS_MESSAGES } from "./types"

export async function patchCategoriaHandler(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const categoriaId = Number(id)
    const body = (await request.json()) as TPatchCategoriaBody
    const result = await patchCategoriaService(categoriaId, body)

    if (!result.ok) {
      return categoriasErrorResponse(result.message, result.status)
    }

    return categoriasPatchSuccessResponse(
      CATEGORIAS_MESSAGES.updateSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en patch-categoria:", error)
    return categoriasErrorResponse(CATEGORIAS_MESSAGES.internalError, 500)
  }
}
