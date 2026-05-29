import { NextResponse } from "next/server"
import type {
  IDeleteCategoriaResponse,
  IGetCategoriasResponse,
  IPostCategoriaResponse,
} from "../interfaces"

export function categoriasJsonResponse<T extends { success: boolean; message: string }>(
  body: T,
  status: number
) {
  return NextResponse.json(body, { status })
}

export function categoriasErrorResponse(message: string, status: number) {
  return categoriasJsonResponse({ success: false, message }, status)
}

export function categoriasGetSuccessResponse(
  message: string,
  data: NonNullable<IGetCategoriasResponse["data"]>
) {
  return categoriasJsonResponse<IGetCategoriasResponse>(
    { success: true, message, data },
    200
  )
}

export function categoriasPostSuccessResponse(
  message: string,
  data: NonNullable<IPostCategoriaResponse["data"]>
) {
  return categoriasJsonResponse<IPostCategoriaResponse>(
    { success: true, message, data },
    201
  )
}

export function categoriasDeleteSuccessResponse(
  message: string,
  data: NonNullable<IDeleteCategoriaResponse["data"]>
) {
  return categoriasJsonResponse<IDeleteCategoriaResponse>(
    { success: true, message, data },
    200
  )
}
