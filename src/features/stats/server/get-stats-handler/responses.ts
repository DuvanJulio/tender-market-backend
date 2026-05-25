import { NextResponse } from "next/server"
import type { IGetStatsResponse } from "../../interfaces"

export function statsJsonResponse(
  body: IGetStatsResponse,
  status: number
): NextResponse<IGetStatsResponse> {
  return NextResponse.json(body, { status })
}

export function statsErrorResponse(
  message: string,
  status: number
): NextResponse<IGetStatsResponse> {
  return statsJsonResponse({ success: false, message }, status)
}

export function statsSuccessResponse(
  message: string,
  data: NonNullable<IGetStatsResponse["data"]>
): NextResponse<IGetStatsResponse> {
  return statsJsonResponse({ success: true, message, data }, 200)
}
