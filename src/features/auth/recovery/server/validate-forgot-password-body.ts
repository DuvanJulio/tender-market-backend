import type { IForgotPasswordRequest } from "../interfaces"
import { RECOVERY_MESSAGES } from "./types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type TValidationResult =
  | { ok: true; data: IForgotPasswordRequest }
  | { ok: false; message: string; status: number }

export function validateForgotPasswordBody(body: unknown): TValidationResult {
  const raw = body as Partial<IForgotPasswordRequest>
  const email = raw.email?.trim()

  if (!email) {
    return {
      ok: false,
      message: RECOVERY_MESSAGES.emailRequired,
      status: 400,
    }
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      ok: false,
      message: RECOVERY_MESSAGES.emailInvalid,
      status: 400,
    }
  }

  return { ok: true, data: { email } }
}
