import { getProductosAdminHandler } from "@/features/catalogo/productos/server"

export async function GET(request: Request) {
  return getProductosAdminHandler(request)
}
