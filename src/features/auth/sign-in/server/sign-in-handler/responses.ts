import { NextResponse } from "next/server"
import type { ISignInResponse } from "../../interfaces"

export function signInJsonResponse(
  body: ISignInResponse,
  status: number
): NextResponse<ISignInResponse> {
  return NextResponse.json(body, { status })
}

export function signInErrorResponse(
  message: string,
  status: number
): NextResponse<ISignInResponse> {
  return signInJsonResponse({ success: false, message }, status)
}

export function signInSuccessResponse(
  message: string,
  data: NonNullable<ISignInResponse["data"]>
): NextResponse<ISignInResponse> {
  return signInJsonResponse({ success: true, message, data }, 200)
}
