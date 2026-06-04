import type { TPatchCityBody } from "../interfaces"
import { MASTERS_MESSAGES } from "./types"
import { patchCityService } from "./patch-city.service"
import {
  mastersPatchCityErrorResponse,
  mastersPatchCitySuccessResponse,
} from "./city-mutation-responses"

export async function patchCityHandler(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const cityId = Number(id)
    const body = (await request.json()) as TPatchCityBody
    const result = await patchCityService(cityId, body)

    if (!result.ok) {
      return mastersPatchCityErrorResponse(result.message, result.status)
    }

    return mastersPatchCitySuccessResponse(
      MASTERS_MESSAGES.cityUpdateSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en patch-city:", error)
    return mastersPatchCityErrorResponse(MASTERS_MESSAGES.internalError, 500)
  }
}
