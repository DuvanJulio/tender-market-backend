import {
  checkEmailErrorResponse,
  checkEmailSuccessResponse,
} from "./responses"
import {
  checkEmailService,
  getCheckEmailMessage,
} from "./check-email.service"
import { validateCheckEmailBody } from "./validate-check-email-body"
import { CHECK_EMAIL_MESSAGES } from "./types"

export async function checkEmailHandler(request: Request) {
  try {
    const body = await request.json()
    const validation = validateCheckEmailBody(body)

    if (!validation.ok) {
      return checkEmailErrorResponse(validation.message, validation.status)
    }

    const result = await checkEmailService(validation.data.email)

    if (!result.ok) {
      return checkEmailErrorResponse(result.message, result.status)
    }

    return checkEmailSuccessResponse(
      getCheckEmailMessage(result.available),
      result.available
    )
  } catch (error) {
    console.error("Error en check-email:", error)
    return checkEmailErrorResponse(CHECK_EMAIL_MESSAGES.internalError, 500)
  }
}
