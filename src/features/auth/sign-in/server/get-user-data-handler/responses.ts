import { NextResponse } from "next/server"
import type { IGetUserDataResponse } from "../../interfaces"

export function getUserDataJsonResponse(
  body: IGetUserDataResponse,
  status: number
): NextResponse<IGetUserDataResponse> {
  return NextResponse.json(body, { status })
}

export function getUserDataErrorResponse(
  message: string,
  status: number
): NextResponse<IGetUserDataResponse> {
  return getUserDataJsonResponse({ success: false, message }, status)
}

export function getUserDataSuccessResponse(
  message: string,
  data: NonNullable<IGetUserDataResponse["data"]>
): NextResponse<IGetUserDataResponse> {
  return getUserDataJsonResponse({ success: true, message, data }, 200)
}
