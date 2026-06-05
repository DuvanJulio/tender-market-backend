import { NextResponse } from "next/server"
import type {
  IPatchPasswordResponse,
  IPatchProfileResponse,
} from "../interfaces"

export function profileErrorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status })
}

export function profileSuccessResponse(
  message: string,
  data: NonNullable<IPatchProfileResponse["data"]>
) {
  return NextResponse.json<IPatchProfileResponse>(
    { success: true, message, data },
    { status: 200 }
  )
}

export function passwordSuccessResponse(message: string) {
  return NextResponse.json<IPatchPasswordResponse>(
    { success: true, message },
    { status: 200 }
  )
}
