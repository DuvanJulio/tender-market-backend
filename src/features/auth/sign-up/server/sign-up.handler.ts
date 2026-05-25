import { SIGN_UP_MESSAGES } from "./types"
import { validateSignUpBody } from "./validate-sign-up-body"
import { signUpErrorResponse, signUpSuccessResponse } from "./responses"
import { signUpService } from "./sign-up.service"

export async function signUpHandler(request: Request) {
  try {
    const body = await request.json()
    const validation = validateSignUpBody(body)

    if (!validation.valid) {
      return signUpErrorResponse(validation.message, 400)
    }

    const result = await signUpService(validation.data)

    if (!result.ok) {
      return signUpErrorResponse(result.message, result.status)
    }

    return signUpSuccessResponse(SIGN_UP_MESSAGES.success, result.data)
  } catch (error) {
    console.error("Error en sign-up:", error)
    return signUpErrorResponse(SIGN_UP_MESSAGES.internalError, 500)
  }
}
