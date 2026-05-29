import {
  getCategoriasHandler,
  postCategoriaHandler,
} from "@/features/catalogo/categorias/server"

export async function GET(request: Request) {
  return getCategoriasHandler(request)
}

export async function POST(request: Request) {
  return postCategoriaHandler(request)
}
