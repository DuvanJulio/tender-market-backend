import { parsePaginationSearchParams } from "@/lib/pagination"
import { CATEGORIAS_MESSAGES } from "./types"
import {
  getCategoriasService,
  type TGetCategoriasQuery,
} from "./get-categorias.service"
import {
  categoriasErrorResponse,
  categoriasGetSuccessResponse,
} from "./responses"

function parseCategoriasQuery(request: Request): TGetCategoriasQuery {
  const { searchParams } = new URL(request.url)
  const { page, pageSize } = parsePaginationSearchParams(searchParams)
  const search = searchParams.get("search")?.trim() || undefined
  return { page, pageSize, search }
}

export async function getCategoriasHandler(request: Request) {
  try {
    const query = parseCategoriasQuery(request)
    const result = await getCategoriasService(query)

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
