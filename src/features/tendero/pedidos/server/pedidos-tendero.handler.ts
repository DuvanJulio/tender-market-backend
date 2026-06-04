import { requireTenderoFromRequest } from "@/lib/auth/require-tendero"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { TApiPedidoEstado } from "@/features/pedidos/interfaces"
import { cancelPedidoTenderoService } from "./cancel-pedido-tendero.service"
import { getCheckoutTenderoService } from "./get-checkout-tendero.service"
import { getPedidosTenderoService } from "./get-pedidos-tendero.service"
import { postPedidoTenderoService } from "./post-pedido-tendero.service"
import {
  tenderoCheckoutSuccessResponse,
  tenderoPedidoCancelSuccessResponse,
  tenderoPedidoCreateSuccessResponse,
  tenderoPedidosErrorResponse,
  tenderoPedidosListSuccessResponse,
} from "./responses"
import { TENDERO_PEDIDOS_MESSAGES } from "./types"

async function fetchContactName(userId: string): Promise<string | undefined> {
  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("nombre, apellido")
    .eq("id", userId)
    .maybeSingle()

  const parts = [usuario?.nombre, usuario?.apellido].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : undefined
}

function parseEstado(param: string | null): TApiPedidoEstado | undefined {
  if (
    param === "pending" ||
    param === "processing" ||
    param === "shipped" ||
    param === "delivered" ||
    param === "cancelled"
  ) {
    return param
  }
  return undefined
}

export async function getPedidosTenderoHandler(request: Request) {
  try {
    const auth = await requireTenderoFromRequest(request)
    if (!auth.ok) {
      return tenderoPedidosErrorResponse(auth.message, auth.status)
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || undefined
    const estado = parseEstado(searchParams.get("estado"))
    const historial = searchParams.get("historial") === "true"
    const contactName = await fetchContactName(auth.context.userId)

    const result = await getPedidosTenderoService({
      tenderoId: auth.context.tenderoId,
      contactName,
      search,
      estado,
      historial,
    })

    if (!result.ok) {
      return tenderoPedidosErrorResponse(result.message, result.status)
    }

    return tenderoPedidosListSuccessResponse(
      TENDERO_PEDIDOS_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-pedidos-tendero:", error)
    return tenderoPedidosErrorResponse(
      TENDERO_PEDIDOS_MESSAGES.internalError,
      500
    )
  }
}

export async function postPedidoTenderoHandler(request: Request) {
  try {
    const auth = await requireTenderoFromRequest(request)
    if (!auth.ok) {
      return tenderoPedidosErrorResponse(auth.message, auth.status)
    }

    const body = await request.json()
    const contactName = await fetchContactName(auth.context.userId)

    const result = await postPedidoTenderoService(
      auth.context.tenderoId,
      contactName,
      body
    )

    if (!result.ok) {
      return tenderoPedidosErrorResponse(result.message, result.status)
    }

    return tenderoPedidoCreateSuccessResponse(
      TENDERO_PEDIDOS_MESSAGES.createSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en post-pedido-tendero:", error)
    return tenderoPedidosErrorResponse(
      TENDERO_PEDIDOS_MESSAGES.internalError,
      500
    )
  }
}

export async function getCheckoutTenderoHandler(request: Request) {
  try {
    const auth = await requireTenderoFromRequest(request)
    if (!auth.ok) {
      return tenderoPedidosErrorResponse(auth.message, auth.status)
    }

    const result = await getCheckoutTenderoService(auth.context.userId)

    if (!result.ok) {
      return tenderoPedidosErrorResponse(result.message, result.status)
    }

    return tenderoCheckoutSuccessResponse(
      TENDERO_PEDIDOS_MESSAGES.checkoutSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-checkout-tendero:", error)
    return tenderoPedidosErrorResponse(
      TENDERO_PEDIDOS_MESSAGES.internalError,
      500
    )
  }
}

export async function cancelPedidoTenderoHandler(
  request: Request,
  codigo: string
) {
  try {
    const auth = await requireTenderoFromRequest(request)
    if (!auth.ok) {
      return tenderoPedidosErrorResponse(auth.message, auth.status)
    }

    const contactName = await fetchContactName(auth.context.userId)
    const result = await cancelPedidoTenderoService(
      auth.context.tenderoId,
      codigo,
      contactName
    )

    if (!result.ok) {
      return tenderoPedidosErrorResponse(result.message, result.status)
    }

    return tenderoPedidoCancelSuccessResponse(
      TENDERO_PEDIDOS_MESSAGES.cancelSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en cancel-pedido-tendero:", error)
    return tenderoPedidosErrorResponse(
      TENDERO_PEDIDOS_MESSAGES.internalError,
      500
    )
  }
}
