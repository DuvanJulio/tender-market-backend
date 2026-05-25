import { SIGN_IN_MESSAGES } from "./types"
import { validateSignInBody } from "./validate-sign-in-body"
import { signInErrorResponse, signInSuccessResponse } from "./responses"
import { signInService } from "./sign-in.service"

export async function signInHandler(request: Request) {
  try {
    const body = await request.json()
    const validation = validateSignInBody(body)

    if (!validation.valid) {
      return signInErrorResponse(validation.message, 400)
    }

    const result = await signInService(validation.data)

    if (!result.ok) {
      return signInErrorResponse(result.message, result.status)
    }

    return signInSuccessResponse(SIGN_IN_MESSAGES.success, result.data)
  } catch (error) {
    console.error("Error en sign-in:", error)
    return signInErrorResponse(SIGN_IN_MESSAGES.internalError, 500)
  }
}
