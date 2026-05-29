import { getUsuariosAdminHandler } from "@/features/admin/usuarios/server"

export async function GET(request: Request) {
  return getUsuariosAdminHandler(request)
}
