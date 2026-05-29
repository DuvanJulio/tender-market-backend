import { NextResponse } from "next/server"
import type {
  IDeleteUsuarioResponse,
  IGetUsuarioResponse,
  IGetUsuariosAdminResponse,
  IPatchUsuarioEstadoResponse,
  IPatchUsuarioResponse,
} from "../interfaces"

export function usuariosAdminJsonResponse<T extends { success: boolean; message: string }>(
  body: T,
  status: number
) {
  return NextResponse.json(body, { status })
}

export function usuariosAdminErrorResponse(message: string, status: number) {
  return usuariosAdminJsonResponse({ success: false, message }, status)
}

export function usuariosAdminListSuccessResponse(
  message: string,
  data: NonNullable<IGetUsuariosAdminResponse["data"]>
) {
  return usuariosAdminJsonResponse<IGetUsuariosAdminResponse>(
    { success: true, message, data },
    200
  )
}

export function usuariosAdminOneSuccessResponse(
  message: string,
  data: NonNullable<IGetUsuarioResponse["data"]>
) {
  return usuariosAdminJsonResponse<IGetUsuarioResponse>(
    { success: true, message, data },
    200
  )
}

export function usuariosAdminPatchSuccessResponse(
  message: string,
  data: NonNullable<IPatchUsuarioResponse["data"]>
) {
  return usuariosAdminJsonResponse<IPatchUsuarioResponse>(
    { success: true, message, data },
    200
  )
}

export function usuariosAdminPatchEstadoSuccessResponse(
  message: string,
  data: NonNullable<IPatchUsuarioEstadoResponse["data"]>
) {
  return usuariosAdminJsonResponse<IPatchUsuarioEstadoResponse>(
    { success: true, message, data },
    200
  )
}

export function usuariosAdminDeleteSuccessResponse(
  message: string,
  data: NonNullable<IDeleteUsuarioResponse["data"]>
) {
  return usuariosAdminJsonResponse<IDeleteUsuarioResponse>(
    { success: true, message, data },
    200
  )
}
