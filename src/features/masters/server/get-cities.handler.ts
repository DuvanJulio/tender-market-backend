import { MASTERS_MESSAGES } from "./types"
import { getCitiesService } from "./get-cities.service"
import { mastersErrorResponse, mastersSuccessResponse } from "./responses"

export async function getCitiesHandler(request?: Request) {
  try {
    const scope = request
      ? new URL(request.url).searchParams.get("scope")
      : null
    const result = await getCitiesService({
      includeInactive: scope === "admin",
    })

    if (!result.ok) {
      return mastersErrorResponse(result.message, result.status)
    }

    return mastersSuccessResponse(MASTERS_MESSAGES.citiesLoadSuccess, result.data)
  } catch (error) {
    console.error("Error en get-cities:", error)
    return mastersErrorResponse(MASTERS_MESSAGES.internalError, 500)
  }
}
