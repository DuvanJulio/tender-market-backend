import { GET_USER_DATA_MESSAGES } from "./types"
import { getUserDataErrorResponse, getUserDataSuccessResponse } from "./responses"
import { getUserDataService } from "./get-user-data.service"

export async function getUserDataHandler(request: Request) {
  try {
    const result = await getUserDataService(request)

    if (!result.ok) {
      return getUserDataErrorResponse(result.message, result.status)
    }

    return getUserDataSuccessResponse(GET_USER_DATA_MESSAGES.success, result.data)
  } catch (error) {
    console.error("Error en get-user-data:", error)
    return getUserDataErrorResponse(GET_USER_DATA_MESSAGES.internalError, 500)
  }
}
