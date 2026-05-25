import { NextResponse } from "next/server"
import type { IGetCitiesResponse } from "../interfaces"

export function mastersJsonResponse(
  body: IGetCitiesResponse,
  status: number
): NextResponse<IGetCitiesResponse> {
  return NextResponse.json(body, { status })
}

export function mastersErrorResponse(
  message: string,
  status: number
): NextResponse<IGetCitiesResponse> {
  return mastersJsonResponse({ success: false, message }, status)
}

export function mastersSuccessResponse(
  message: string,
  data: NonNullable<IGetCitiesResponse["data"]>
): NextResponse<IGetCitiesResponse> {
  return mastersJsonResponse({ success: true, message, data }, 200)
}
