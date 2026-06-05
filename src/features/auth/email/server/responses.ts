import { NextResponse } from "next/server"
import type { ICheckEmailResponse } from "../interfaces"

export function checkEmailErrorResponse(message: string, status: number) {
  return NextResponse.json<ICheckEmailResponse>(
    { success: false, message },
    { status }
  )
}

export function checkEmailSuccessResponse(
  message: string,
  available: boolean
) {
  return NextResponse.json<ICheckEmailResponse>(
    { success: true, message, data: { available } },
    { status: 200 }
  )
}
