import { emailExistsInAuth } from "@/lib/auth/email-exists"
import { CHECK_EMAIL_MESSAGES } from "./types"

type TCheckEmailServiceResult =
  | { ok: true; available: boolean }
  | { ok: false; message: string; status: number }

export async function checkEmailService(
  email: string
): Promise<TCheckEmailServiceResult> {
  try {
    const exists = await emailExistsInAuth(email)
    return { ok: true, available: !exists }
  } catch {
    return {
      ok: false,
      message: CHECK_EMAIL_MESSAGES.internalError,
      status: 500,
    }
  }
}

export function getCheckEmailMessage(available: boolean): string {
  return available
    ? CHECK_EMAIL_MESSAGES.available
    : CHECK_EMAIL_MESSAGES.unavailable
}
