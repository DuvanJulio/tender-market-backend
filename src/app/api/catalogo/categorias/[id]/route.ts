import {
  deleteCategoriaHandler,
  patchCategoriaHandler,
} from "@/features/catalogo/categorias/server"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return patchCategoriaHandler(request, context)
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return deleteCategoriaHandler(request, context)
}
