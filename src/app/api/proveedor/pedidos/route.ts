import { getPedidosProveedorHandler } from "@/features/proveedor/pedidos/server"

export async function GET(request: Request) {
  return getPedidosProveedorHandler(request)
}
