import { PROFILE_MESSAGES } from "./types"
import { patchProfileService } from "./patch-profile.service"
import { patchPasswordService } from "./patch-password.service"
import {
  passwordSuccessResponse,
  profileErrorResponse,
  profileSuccessResponse,
} from "./responses"
import {
  validatePatchPasswordBody,
  validatePatchProfileBody,
} from "./validate-profile-body"

export async function patchProfileHandler(request: Request) {
  try {
    const body = await request.json()
    const validation = validatePatchProfileBody(body)

    if (!validation.ok) {
      return profileErrorResponse(validation.message, validation.status)
    }

    const result = await patchProfileService(request, validation.data)

    if (!result.ok) {
      return profileErrorResponse(result.message, result.status)
    }

    return profileSuccessResponse(PROFILE_MESSAGES.success, result.data)
  } catch (error) {
    console.error("Error en patch-profile:", error)
    return profileErrorResponse(PROFILE_MESSAGES.internalError, 500)
  }
}

export async function patchPasswordHandler(request: Request) {
  try {
    const body = await request.json()
    const validation = validatePatchPasswordBody(body)

    if (!validation.ok) {
      return profileErrorResponse(validation.message, validation.status)
    }

    const result = await patchPasswordService(request, validation.data)

    if (!result.ok) {
      return profileErrorResponse(result.message, result.status)
    }

    return passwordSuccessResponse(PROFILE_MESSAGES.passwordSuccess)
  } catch (error) {
    console.error("Error en patch-password:", error)
    return profileErrorResponse(PROFILE_MESSAGES.internalError, 500)
  }
}
