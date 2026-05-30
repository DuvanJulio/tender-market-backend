import { NextResponse } from "next/server"
import type { IGetProveedorDashboardResponse } from "../interfaces"

export function proveedorDashboardErrorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status })
}

export function proveedorDashboardSuccessResponse(
  message: string,
  data: NonNullable<IGetProveedorDashboardResponse["data"]>
) {
  return NextResponse.json<IGetProveedorDashboardResponse>(
    { success: true, message, data },
    { status: 200 }
  )
}
