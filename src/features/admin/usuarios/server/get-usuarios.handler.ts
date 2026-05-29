import { parsePaginationSearchParams } from "@/lib/pagination"
import { USUARIOS_ADMIN_MESSAGES } from "./types"
import {
  getUsuariosAdminService,
  type TGetUsuariosAdminQuery,
} from "./get-usuarios.service"
import {
  usuariosAdminErrorResponse,
  usuariosAdminListSuccessResponse,
} from "./responses"

function parseUsuariosQuery(request: Request): TGetUsuariosAdminQuery {
  const { searchParams } = new URL(request.url)
  const { page, pageSize } = parsePaginationSearchParams(searchParams)

  const search = searchParams.get("search")?.trim() || undefined
  const rolParam = searchParams.get("rol")
  const estadoParam = searchParams.get("estado")

  const rol =
    rolParam === "tendero" || rolParam === "proveedor" ? rolParam : undefined
  const estado =
    estadoParam === "activo" ||
    estadoParam === "pendiente" ||
    estadoParam === "inactivo"
      ? estadoParam
      : undefined

  return { page, pageSize, search, rol, estado }
}

export async function getUsuariosAdminHandler(request: Request) {
  try {
    const query = parseUsuariosQuery(request)
    const result = await getUsuariosAdminService(query)

    if (!result.ok) {
      return usuariosAdminErrorResponse(result.message, result.status)
    }

    return usuariosAdminListSuccessResponse(
      USUARIOS_ADMIN_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-usuarios-admin:", error)
    return usuariosAdminErrorResponse(
      USUARIOS_ADMIN_MESSAGES.internalError,
      500
    )
  }
}
