import { NextResponse } from "next/server"
import type {
  IForgotPasswordResponse,
  IResetPasswordResponse,
} from "../interfaces"

export function recoveryErrorResponse(
  message: string,
  status: number
) {
  return NextResponse.json({ success: false, message }, { status })
}

export function forgotPasswordSuccessResponse(message: string) {
  return NextResponse.json<IForgotPasswordResponse>(
    { success: true, message },
    { status: 200 }
  )
}

export function resetPasswordSuccessResponse(message: string) {
  return NextResponse.json<IResetPasswordResponse>(
    { success: true, message },
    { status: 200 }
  )
}
