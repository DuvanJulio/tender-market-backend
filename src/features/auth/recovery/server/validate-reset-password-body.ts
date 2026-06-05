import type { IResetPasswordRequest } from "../interfaces"
import { RECOVERY_MESSAGES } from "./types"

type TValidationResult =
  | { ok: true; data: IResetPasswordRequest }
  | { ok: false; message: string; status: number }

export function validateResetPasswordBody(body: unknown): TValidationResult {
  const raw = body as Partial<IResetPasswordRequest>
  const password = raw.password?.trim()
  const accessToken = raw.access_token?.trim()
  const refreshToken = raw.refresh_token?.trim()
  const tokenHash = raw.token_hash?.trim()

  if (!password) {
    return {
      ok: false,
      message: RECOVERY_MESSAGES.passwordRequired,
      status: 400,
    }
  }

  if (password.length < 8) {
    return {
      ok: false,
      message: RECOVERY_MESSAGES.passwordTooShort,
      status: 400,
    }
  }

  const hasSessionTokens = Boolean(accessToken && refreshToken)
  const hasTokenHash = Boolean(tokenHash)

  if (!hasSessionTokens && !hasTokenHash) {
    return {
      ok: false,
      message: RECOVERY_MESSAGES.tokenRequired,
      status: 400,
    }
  }

  return {
    ok: true,
    data: {
      password,
      ...(accessToken ? { access_token: accessToken } : {}),
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
      ...(tokenHash ? { token_hash: tokenHash } : {}),
    },
  }
}
