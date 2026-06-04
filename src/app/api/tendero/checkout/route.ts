import { getCheckoutTenderoHandler } from "@/features/tendero/pedidos/server"

export async function GET(request: Request) {
  return getCheckoutTenderoHandler(request)
}
