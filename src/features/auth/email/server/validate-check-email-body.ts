import type { ICheckEmailRequest } from "../interfaces"
import { CHECK_EMAIL_MESSAGES } from "./types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type TValidationResult =
  | { ok: true; data: ICheckEmailRequest }
  | { ok: false; message: string; status: number }

export function validateCheckEmailBody(body: unknown): TValidationResult {
  const raw = body as Partial<ICheckEmailRequest>
  const email = raw.email?.trim()

  if (!email) {
    return {
      ok: false,
      message: CHECK_EMAIL_MESSAGES.emailRequired,
      status: 400,
    }
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      ok: false,
      message: CHECK_EMAIL_MESSAGES.emailInvalid,
      status: 400,
    }
  }

  return { ok: true, data: { email } }
}
