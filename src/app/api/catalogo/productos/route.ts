import { getProductosAdminHandler } from "@/features/catalogo/productos/server"

export async function GET() {
  return getProductosAdminHandler()
}
