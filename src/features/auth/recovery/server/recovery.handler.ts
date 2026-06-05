import {
  forgotPasswordSuccessResponse,
  recoveryErrorResponse,
  resetPasswordSuccessResponse,
} from "./responses"
import { forgotPasswordService } from "./forgot-password.service"
import { resetPasswordService } from "./reset-password.service"
import { validateForgotPasswordBody } from "./validate-forgot-password-body"
import { validateResetPasswordBody } from "./validate-reset-password-body"
import { RECOVERY_MESSAGES } from "./types"

export async function forgotPasswordHandler(request: Request) {
  try {
    const body = await request.json()
    const validation = validateForgotPasswordBody(body)

    if (!validation.ok) {
      return recoveryErrorResponse(validation.message, validation.status)
    }

    const result = await forgotPasswordService(validation.data.email)

    if (!result.ok) {
      return recoveryErrorResponse(result.message, result.status)
    }

    return forgotPasswordSuccessResponse(RECOVERY_MESSAGES.forgotPasswordSuccess)
  } catch (error) {
    console.error("Error en forgot-password:", error)
    return recoveryErrorResponse(RECOVERY_MESSAGES.internalError, 500)
  }
}

export async function resetPasswordHandler(request: Request) {
  try {
    const body = await request.json()
    const validation = validateResetPasswordBody(body)

    if (!validation.ok) {
      return recoveryErrorResponse(validation.message, validation.status)
    }

    const result = await resetPasswordService(validation.data)

    if (!result.ok) {
      return recoveryErrorResponse(result.message, result.status)
    }

    return resetPasswordSuccessResponse(RECOVERY_MESSAGES.resetPasswordSuccess)
  } catch (error) {
    console.error("Error en reset-password:", error)
    return recoveryErrorResponse(RECOVERY_MESSAGES.internalError, 500)
  }
}
