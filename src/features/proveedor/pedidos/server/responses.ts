import { NextResponse } from "next/server"
import type {
  IGetPedidosProveedorResponse,
  IPatchPedidoEstadoResponse,
} from "@/features/pedidos/interfaces"

export function proveedorPedidosErrorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status })
}

export function proveedorPedidosListSuccessResponse(
  message: string,
  data: NonNullable<IGetPedidosProveedorResponse["data"]>
) {
  return NextResponse.json<IGetPedidosProveedorResponse>(
    { success: true, message, data },
    { status: 200 }
  )
}

export function proveedorPedidoPatchSuccessResponse(
  message: string,
  data: NonNullable<IPatchPedidoEstadoResponse["data"]>,
  whatsapp_url?: string | null
) {
  return NextResponse.json<IPatchPedidoEstadoResponse>(
    { success: true, message, data, whatsapp_url: whatsapp_url ?? null },
    { status: 200 }
  )
}
