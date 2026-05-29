import { USUARIOS_ADMIN_MESSAGES } from "./types"
import { deleteUsuarioAdminService } from "./delete-usuario.service"
import {
  usuariosAdminDeleteSuccessResponse,
  usuariosAdminErrorResponse,
} from "./responses"

export async function deleteUsuarioAdminHandler(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const result = await deleteUsuarioAdminService(id)

    if (!result.ok) {
      return usuariosAdminErrorResponse(result.message, result.status)
    }

    return usuariosAdminDeleteSuccessResponse(
      USUARIOS_ADMIN_MESSAGES.deleteSuccess,
      { id: result.id }
    )
  } catch (error) {
    console.error("Error en delete-usuario-admin:", error)
    return usuariosAdminErrorResponse(
      USUARIOS_ADMIN_MESSAGES.internalError,
      500
    )
  }
}
