import { NextResponse } from "next/server"
import type { IDeleteCityResponse, IPostCityResponse } from "../interfaces"

export function mastersPostCityJsonResponse(
  body: IPostCityResponse,
  status: number
) {
  return NextResponse.json(body, { status })
}

export function mastersPostCityErrorResponse(message: string, status: number) {
  return mastersPostCityJsonResponse({ success: false, message }, status)
}

export function mastersPostCitySuccessResponse(
  message: string,
  data: NonNullable<IPostCityResponse["data"]>
) {
  return mastersPostCityJsonResponse({ success: true, message, data }, 201)
}

export function mastersDeleteCityJsonResponse(
  body: IDeleteCityResponse,
  status: number
) {
  return NextResponse.json(body, { status })
}

export function mastersDeleteCityErrorResponse(
  message: string,
  status: number
) {
  return mastersDeleteCityJsonResponse({ success: false, message }, status)
}

export function mastersDeleteCitySuccessResponse(
  message: string,
  data: NonNullable<IDeleteCityResponse["data"]>
) {
  return mastersDeleteCityJsonResponse({ success: true, message, data }, 200)
}
