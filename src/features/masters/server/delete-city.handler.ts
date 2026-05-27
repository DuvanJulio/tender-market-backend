import { MASTERS_MESSAGES } from "./types"
import { deleteCityService } from "./delete-city.service"
import {
  mastersDeleteCityErrorResponse,
  mastersDeleteCitySuccessResponse,
} from "./city-mutation-responses"

export async function deleteCityHandler(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const cityId = Number(id)
    const result = await deleteCityService(cityId)

    if (!result.ok) {
      return mastersDeleteCityErrorResponse(result.message, result.status)
    }

    return mastersDeleteCitySuccessResponse(
      MASTERS_MESSAGES.cityDeleteSuccess,
      { id: result.id }
    )
  } catch (error) {
    console.error("Error en delete-city:", error)
    return mastersDeleteCityErrorResponse(MASTERS_MESSAGES.internalError, 500)
  }
}
