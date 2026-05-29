import { parsePaginationSearchParams } from "@/lib/pagination"
import { PRODUCTOS_MESSAGES } from "./types"
import {
  getProductosAdminService,
  type TGetProductosAdminQuery,
} from "./get-productos.service"
import {
  productosErrorResponse,
  productosGetSuccessResponse,
} from "./responses"

function parseProductosQuery(request: Request): TGetProductosAdminQuery {
  const { searchParams } = new URL(request.url)
  const { page, pageSize } = parsePaginationSearchParams(searchParams)
  const search = searchParams.get("search")?.trim() || undefined
  const estadoParam = searchParams.get("estado")
  const estado =
    estadoParam === "borrador" ||
    estadoParam === "publicado" ||
    estadoParam === "inactivo"
      ? estadoParam
      : undefined

  return { page, pageSize, search, estado }
}

export async function getProductosAdminHandler(request: Request) {
  try {
    const query = parseProductosQuery(request)
    const result = await getProductosAdminService(query)

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
