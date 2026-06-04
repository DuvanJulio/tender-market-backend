import { NextResponse } from "next/server"
import type { IGetCatalogoTenderoResponse } from "../interfaces"

export function catalogoTenderoErrorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status })
}

export function catalogoTenderoSuccessResponse(
  message: string,
  data: NonNullable<IGetCatalogoTenderoResponse["data"]>
) {
  return NextResponse.json<IGetCatalogoTenderoResponse>(
    { success: true, message, data },
    { status: 200 }
  )
}
