import { STATS_MESSAGES } from "./types"
import { statsErrorResponse, statsSuccessResponse } from "./responses"
import { getStatsService } from "./get-stats.service"

export async function getStatsHandler() {
  try {
    const result = await getStatsService()

    if (!result.ok) {
      return statsErrorResponse(result.message, result.status)
    }

    return statsSuccessResponse(STATS_MESSAGES.success, result.data)
  } catch (error) {
    console.error("Error en get-stats:", error)
    return statsErrorResponse(STATS_MESSAGES.internalError, 500)
  }
}
