import {
  deleteUsuarioAdminHandler,
  getUsuarioAdminHandler,
  patchUsuarioAdminHandler,
} from "@/features/admin/usuarios/server"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return getUsuarioAdminHandler(request, context)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return patchUsuarioAdminHandler(request, context)
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return deleteUsuarioAdminHandler(request, context)
}
