import type { TPatchUsuarioBody } from "../interfaces"
import { USUARIOS_ADMIN_MESSAGES } from "./types"
import { patchUsuarioAdminService } from "./patch-usuario.service"
import {
  usuariosAdminErrorResponse,
  usuariosAdminPatchSuccessResponse,
} from "./responses"

export async function patchUsuarioAdminHandler(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as TPatchUsuarioBody
    const result = await patchUsuarioAdminService(id, body)

    if (!result.ok) {
      return usuariosAdminErrorResponse(result.message, result.status)
    }

    return usuariosAdminPatchSuccessResponse(
      USUARIOS_ADMIN_MESSAGES.updateSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en patch-usuario-admin:", error)
    return usuariosAdminErrorResponse(
      USUARIOS_ADMIN_MESSAGES.internalError,
      500
    )
  }
}
