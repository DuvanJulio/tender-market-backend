import { getCatalogoTenderoHandler } from "@/features/tendero/catalogo/server"

export async function GET(request: Request) {
  return getCatalogoTenderoHandler(request)
}
