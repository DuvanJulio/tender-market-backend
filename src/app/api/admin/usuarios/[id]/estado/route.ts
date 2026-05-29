import { patchUsuarioEstadoHandler } from "@/features/admin/usuarios/server"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return patchUsuarioEstadoHandler(request, context)
}
