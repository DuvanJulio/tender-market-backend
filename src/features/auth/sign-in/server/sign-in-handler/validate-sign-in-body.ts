import type { ISignInRequest } from "../../interfaces"
import { SIGN_IN_MESSAGES } from "./types"

export type TSignInValidationResult =
  | { valid: true; data: ISignInRequest }
  | { valid: false; message: string }

export function validateSignInBody(body: unknown): TSignInValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, message: SIGN_IN_MESSAGES.missingCredentials }
  }

  const { email, password } = body as Partial<ISignInRequest>

  if (!email?.trim() || !password) {
    return { valid: false, message: SIGN_IN_MESSAGES.missingCredentials }
  }

  return {
    valid: true,
    data: {
      email: email.trim(),
      password,
    },
  }
}
