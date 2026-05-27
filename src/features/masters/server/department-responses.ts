import { NextResponse } from "next/server"
import type {
  IGetDepartmentsResponse,
  IPostDepartmentResponse,
} from "../interfaces"

export function mastersDepartmentsJsonResponse(
  body: IGetDepartmentsResponse,
  status: number
) {
  return NextResponse.json(body, { status })
}

export function mastersDepartmentsErrorResponse(
  message: string,
  status: number
) {
  return mastersDepartmentsJsonResponse({ success: false, message }, status)
}

export function mastersDepartmentsSuccessResponse(
  message: string,
  data: NonNullable<IGetDepartmentsResponse["data"]>
) {
  return mastersDepartmentsJsonResponse(
    { success: true, message, data },
    200
  )
}

export function mastersPostDepartmentJsonResponse(
  body: IPostDepartmentResponse,
  status: number
) {
  return NextResponse.json(body, { status })
}

export function mastersPostDepartmentErrorResponse(
  message: string,
  status: number
) {
  return mastersPostDepartmentJsonResponse({ success: false, message }, status)
}

export function mastersPostDepartmentSuccessResponse(
  message: string,
  data: NonNullable<IPostDepartmentResponse["data"]>
) {
  return mastersPostDepartmentJsonResponse(
    { success: true, message, data },
    201
  )
}
