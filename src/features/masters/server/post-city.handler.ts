import type { TPostCityBody } from "../interfaces"
import { MASTERS_MESSAGES } from "./types"
import { postCityService } from "./post-city.service"
import {
  mastersPostCityErrorResponse,
  mastersPostCitySuccessResponse,
} from "./city-mutation-responses"

export async function postCityHandler(request: Request) {
  try {
    const body = (await request.json()) as TPostCityBody
    const result = await postCityService(body)

    if (!result.ok) {
      return mastersPostCityErrorResponse(result.message, result.status)
    }

    return mastersPostCitySuccessResponse(
      MASTERS_MESSAGES.cityCreateSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en post-city:", error)
    return mastersPostCityErrorResponse(MASTERS_MESSAGES.internalError, 500)
  }
}
