import { patchProductoEstadoHandler } from "@/features/catalogo/productos/server"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return patchProductoEstadoHandler(request, context)
}
