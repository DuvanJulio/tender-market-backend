import { USUARIOS_ADMIN_MESSAGES } from "./types"
import { getUsuarioAdminService } from "./get-usuario.service"
import {
  usuariosAdminErrorResponse,
  usuariosAdminOneSuccessResponse,
} from "./responses"

export async function getUsuarioAdminHandler(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const result = await getUsuarioAdminService(id)

    if (!result.ok) {
      return usuariosAdminErrorResponse(result.message, result.status)
    }

    return usuariosAdminOneSuccessResponse(
      USUARIOS_ADMIN_MESSAGES.detailLoadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-usuario-admin:", error)
    return usuariosAdminErrorResponse(
      USUARIOS_ADMIN_MESSAGES.internalError,
      500
    )
  }
}
