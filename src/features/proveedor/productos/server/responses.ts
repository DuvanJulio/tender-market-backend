import { NextResponse } from "next/server"
import type {
  IDeleteProductoProveedorResponse,
  IGetProductoProveedorResponse,
  IGetProductosProveedorResponse,
  IPatchProductoProveedorResponse,
  IPostProductoProveedorResponse,
} from "../interfaces"

function jsonResponse<T extends { success: boolean; message: string }>(
  body: T,
  status = 200
) {
  return NextResponse.json(body, { status })
}

export function proveedorProductosErrorResponse(message: string, status: number) {
  return jsonResponse({ success: false, message }, status)
}

export function proveedorProductosListSuccessResponse(
  message: string,
  data: NonNullable<IGetProductosProveedorResponse["data"]>
) {
  return jsonResponse<IGetProductosProveedorResponse>(
    { success: true, message, data },
    200
  )
}

export function proveedorProductoSuccessResponse(
  message: string,
  data: NonNullable<
    | IGetProductoProveedorResponse["data"]
    | IPostProductoProveedorResponse["data"]
    | IPatchProductoProveedorResponse["data"]
  >
) {
  return jsonResponse(
    { success: true, message, data },
    200
  )
}

export function proveedorProductoDeleteSuccessResponse(
  message: string,
  data: { id: number }
) {
  return jsonResponse<IDeleteProductoProveedorResponse>(
    { success: true, message, data },
    200
  )
}
