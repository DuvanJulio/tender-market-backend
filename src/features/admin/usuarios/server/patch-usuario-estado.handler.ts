import type { TPatchUsuarioEstadoBody } from "../interfaces"
import { USUARIOS_ADMIN_MESSAGES } from "./types"
import { patchUsuarioEstadoService } from "./patch-usuario-estado.service"
import {
  usuariosAdminErrorResponse,
  usuariosAdminPatchEstadoSuccessResponse,
} from "./responses"

export async function patchUsuarioEstadoHandler(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as TPatchUsuarioEstadoBody
    const result = await patchUsuarioEstadoService(id, body)

    if (!result.ok) {
      return usuariosAdminErrorResponse(result.message, result.status)
    }

    let successMessage: string = USUARIOS_ADMIN_MESSAGES.deactivateSuccess

    if (result.data.estado === "activo") {
      successMessage =
        result.data.estado_anterior === "pendiente"
          ? USUARIOS_ADMIN_MESSAGES.approveSuccess
          : USUARIOS_ADMIN_MESSAGES.reactivateSuccess
    }

    return usuariosAdminPatchEstadoSuccessResponse(successMessage, {
      id: result.data.id,
      estado: result.data.estado,
    })
  } catch (error) {
    console.error("Error en patch-usuario-estado:", error)
    return usuariosAdminErrorResponse(
      USUARIOS_ADMIN_MESSAGES.internalError,
      500
    )
  }
}
