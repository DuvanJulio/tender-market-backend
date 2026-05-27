import type { TPostDepartmentBody } from "../interfaces"
import { MASTERS_MESSAGES } from "./types"
import { postDepartmentService } from "./post-department.service"
import {
  mastersPostDepartmentErrorResponse,
  mastersPostDepartmentSuccessResponse,
} from "./department-responses"

export async function postDepartmentHandler(request: Request) {
  try {
    const body = (await request.json()) as TPostDepartmentBody
    const result = await postDepartmentService(body)

    if (!result.ok) {
      return mastersPostDepartmentErrorResponse(result.message, result.status)
    }

    return mastersPostDepartmentSuccessResponse(
      MASTERS_MESSAGES.departmentCreateSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en post-department:", error)
    return mastersPostDepartmentErrorResponse(MASTERS_MESSAGES.internalError, 500)
  }
}
