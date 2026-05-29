import { USUARIOS_ADMIN_MESSAGES } from "./types"
import { getUsuariosAdminService } from "./get-usuarios.service"
import {
  usuariosAdminErrorResponse,
  usuariosAdminListSuccessResponse,
} from "./responses"

export async function getUsuariosAdminHandler() {
  try {
    const result = await getUsuariosAdminService()

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
