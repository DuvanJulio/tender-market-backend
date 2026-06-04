import { NextResponse } from "next/server"
import type { IGetNotificacionesResponse, IPatchNotificacionLeidaResponse } from "../interfaces"

export function notificacionesErrorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status })
}

export function notificacionesListSuccessResponse(
  message: string,
  data: NonNullable<IGetNotificacionesResponse["data"]>
) {
  return NextResponse.json<IGetNotificacionesResponse>(
    { success: true, message, data },
    { status: 200 }
  )
}

export function notificacionMarkReadSuccessResponse(
  message: string,
  data: NonNullable<IPatchNotificacionLeidaResponse["data"]>
) {
  return NextResponse.json<IPatchNotificacionLeidaResponse>(
    { success: true, message, data },
    { status: 200 }
  )
}
