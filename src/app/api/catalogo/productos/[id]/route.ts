import { deleteProductoHandler } from "@/features/catalogo/productos/server"

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return deleteProductoHandler(request, context)
}
