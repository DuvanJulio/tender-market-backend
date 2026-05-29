import { deleteCategoriaHandler } from "@/features/catalogo/categorias/server"

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return deleteCategoriaHandler(request, context)
}
