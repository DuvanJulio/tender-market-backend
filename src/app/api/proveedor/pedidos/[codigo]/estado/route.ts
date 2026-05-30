import { patchPedidoEstadoHandler } from "@/features/proveedor/pedidos/server"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ codigo: string }> }
) {
  return patchPedidoEstadoHandler(request, context)
}
