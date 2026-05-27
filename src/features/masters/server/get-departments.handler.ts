import { MASTERS_MESSAGES } from "./types"
import { getDepartmentsService } from "./get-departments.service"
import {
  mastersDepartmentsErrorResponse,
  mastersDepartmentsSuccessResponse,
} from "./department-responses"

export async function getDepartmentsHandler() {
  try {
    const result = await getDepartmentsService()

    if (!result.ok) {
      return mastersDepartmentsErrorResponse(result.message, result.status)
    }

    return mastersDepartmentsSuccessResponse(
      MASTERS_MESSAGES.departmentsLoadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-departments:", error)
    return mastersDepartmentsErrorResponse(MASTERS_MESSAGES.internalError, 500)
  }
}
