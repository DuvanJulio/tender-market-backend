import { NextResponse } from "next/server"
import type { ISignUpResponse } from "../interfaces"

export function signUpJsonResponse(
  body: ISignUpResponse,
  status: number
): NextResponse<ISignUpResponse> {
  return NextResponse.json(body, { status })
}

export function signUpErrorResponse(
  message: string,
  status: number
): NextResponse<ISignUpResponse> {
  return signUpJsonResponse({ success: false, message }, status)
}

export function signUpSuccessResponse(
  message: string,
  data: NonNullable<ISignUpResponse["data"]>
): NextResponse<ISignUpResponse> {
  return signUpJsonResponse({ success: true, message, data }, 201)
}
