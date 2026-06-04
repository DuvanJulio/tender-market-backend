import { NextResponse } from "next/server"
import type {
  IGetCheckoutTenderoResponse,
  IGetPedidosTenderoResponse,
  IPatchCancelarPedidoTenderoResponse,
  IPostPedidoTenderoResponse,
} from "@/features/pedidos/interfaces"

export function tenderoPedidosErrorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status })
}

export function tenderoPedidosListSuccessResponse(
  message: string,
  data: NonNullable<IGetPedidosTenderoResponse["data"]>
) {
  return NextResponse.json<IGetPedidosTenderoResponse>(
    { success: true, message, data },
    { status: 200 }
  )
}

export function tenderoPedidoCreateSuccessResponse(
  message: string,
  data: NonNullable<IPostPedidoTenderoResponse["data"]>
) {
  return NextResponse.json<IPostPedidoTenderoResponse>(
    { success: true, message, data },
    { status: 201 }
  )
}

export function tenderoPedidoCancelSuccessResponse(
  message: string,
  data: NonNullable<IPatchCancelarPedidoTenderoResponse["data"]>
) {
  return NextResponse.json<IPatchCancelarPedidoTenderoResponse>(
    { success: true, message, data },
    { status: 200 }
  )
}

export function tenderoCheckoutSuccessResponse(
  message: string,
  data: NonNullable<IGetCheckoutTenderoResponse["data"]>
) {
  return NextResponse.json<IGetCheckoutTenderoResponse>(
    { success: true, message, data },
    { status: 200 }
  )
}
