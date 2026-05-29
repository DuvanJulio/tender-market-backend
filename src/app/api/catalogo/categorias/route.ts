import {
  getCategoriasHandler,
  postCategoriaHandler,
} from "@/features/catalogo/categorias/server"

export async function GET() {
  return getCategoriasHandler()
}

export async function POST(request: Request) {
  return postCategoriaHandler(request)
}
