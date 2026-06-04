import { requireTenderoFromRequest } from "@/lib/auth/require-tendero"
import { getCatalogoTenderoService } from "./get-catalogo-tendero.service"
import {
  catalogoTenderoErrorResponse,
  catalogoTenderoSuccessResponse,
} from "./responses"
import { CATALOGO_TENDERO_MESSAGES } from "./types"

function parseQuery(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")?.trim() || undefined
  const categoriaParam = searchParams.get("categoria_id")
  const categoria_id = categoriaParam ? Number(categoriaParam) : undefined

  return {
    search,
    categoria_id:
      categoria_id && !Number.isNaN(categoria_id) ? categoria_id : undefined,
  }
}

export async function getCatalogoTenderoHandler(request: Request) {
  try {
    const auth = await requireTenderoFromRequest(request)
    if (!auth.ok) {
      return catalogoTenderoErrorResponse(auth.message, auth.status)
    }

    const query = parseQuery(request)
    const result = await getCatalogoTenderoService(query)

    if (!result.ok) {
      return catalogoTenderoErrorResponse(result.message, result.status)
    }

    return catalogoTenderoSuccessResponse(
      CATALOGO_TENDERO_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-catalogo-tendero:", error)
    return catalogoTenderoErrorResponse(
      CATALOGO_TENDERO_MESSAGES.internalError,
      500
    )
  }
}
