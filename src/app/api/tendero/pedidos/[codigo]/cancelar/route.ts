import { cancelPedidoTenderoHandler } from "@/features/tendero/pedidos/server"

type RouteContext = {
  params: Promise<{ codigo: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const { codigo } = await context.params
  return cancelPedidoTenderoHandler(request, codigo)
}
