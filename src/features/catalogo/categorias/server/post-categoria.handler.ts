import type { TPostCategoriaBody } from "../interfaces"
import { CATEGORIAS_MESSAGES } from "./types"
import { postCategoriaService } from "./post-categoria.service"
import {
  categoriasErrorResponse,
  categoriasPostSuccessResponse,
} from "./responses"

export async function postCategoriaHandler(request: Request) {
  try {
    const body = (await request.json()) as TPostCategoriaBody
    const result = await postCategoriaService(body)

    if (!result.ok) {
      return categoriasErrorResponse(result.message, result.status)
    }

    return categoriasPostSuccessResponse(
      CATEGORIAS_MESSAGES.createSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en post-categoria:", error)
    return categoriasErrorResponse(CATEGORIAS_MESSAGES.internalError, 500)
  }
}
