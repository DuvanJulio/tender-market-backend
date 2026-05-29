import { getUsuariosAdminHandler } from "@/features/admin/usuarios/server"

export async function GET() {
  return getUsuariosAdminHandler()
}
