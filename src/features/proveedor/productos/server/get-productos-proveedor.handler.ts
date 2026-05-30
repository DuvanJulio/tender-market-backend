import { requireProveedorFromRequest } from "@/lib/auth/require-proveedor"
import { parsePaginationSearchParams } from "@/lib/pagination"
import {
  getProductosProveedorService,
  type TGetProductosProveedorQuery,
} from "./get-productos-proveedor.service"
import {
  proveedorProductosErrorResponse,
  proveedorProductosListSuccessResponse,
} from "./responses"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"

function parseQuery(request: Request) {
  const { searchParams } = new URL(request.url)
  const { page, pageSize } = parsePaginationSearchParams(searchParams)
  const search = searchParams.get("search")?.trim() || undefined
  const estadoParam = searchParams.get("estado")
  const estado: TGetProductosProveedorQuery["estado"] =
    estadoParam === "borrador" ||
    estadoParam === "publicado" ||
    estadoParam === "inactivo"
      ? estadoParam
      : undefined
  const bajo_stock = searchParams.get("bajo_stock") === "true"
  const sin_stock = searchParams.get("sin_stock") === "true"

  return { page, pageSize, search, estado, bajo_stock, sin_stock }
}

export async function getProductosProveedorHandler(request: Request) {
  try {
    const auth = await requireProveedorFromRequest(request)
    if (!auth.ok) {
      return proveedorProductosErrorResponse(auth.message, auth.status)
    }

    const query = parseQuery(request)
    const result = await getProductosProveedorService({
      proveedorId: auth.context.proveedorId,
      ...query,
    })

    if (!result.ok) {
      return proveedorProductosErrorResponse(result.message, result.status)
    }

    return proveedorProductosListSuccessResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-productos-proveedor:", error)
    return proveedorProductosErrorResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.internalError,
      500
    )
  }
}
