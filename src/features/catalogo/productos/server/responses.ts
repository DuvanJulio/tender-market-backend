import { NextResponse } from "next/server"
import type {
  IDeleteProductoResponse,
  IGetProductosAdminResponse,
  IPatchProductoEstadoResponse,
} from "../interfaces"

export function productosJsonResponse<T extends { success: boolean; message: string }>(
  body: T,
  status: number
) {
  return NextResponse.json(body, { status })
}

export function productosErrorResponse(message: string, status: number) {
  return productosJsonResponse({ success: false, message }, status)
}

export function productosGetSuccessResponse(
  message: string,
  data: NonNullable<IGetProductosAdminResponse["data"]>
) {
  return productosJsonResponse<IGetProductosAdminResponse>(
    { success: true, message, data },
    200
  )
}

export function productosPatchSuccessResponse(
  message: string,
  data: NonNullable<IPatchProductoEstadoResponse["data"]>
) {
  return productosJsonResponse<IPatchProductoEstadoResponse>(
    { success: true, message, data },
    200
  )
}

export function productosDeleteSuccessResponse(
  message: string,
  data: NonNullable<IDeleteProductoResponse["data"]>
) {
  return productosJsonResponse<IDeleteProductoResponse>(
    { success: true, message, data },
    200
  )
}
