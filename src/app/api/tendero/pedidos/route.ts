import {
  getCheckoutTenderoHandler,
  getPedidosTenderoHandler,
  postPedidoTenderoHandler,
} from "@/features/tendero/pedidos/server"

export async function GET(request: Request) {
  return getPedidosTenderoHandler(request)
}

export async function POST(request: Request) {
  return postPedidoTenderoHandler(request)
}
