import { createClient } from "@supabase/supabase-js"
import type { IResetPasswordRequest } from "../interfaces"
import { RECOVERY_MESSAGES } from "./types"

type TResetPasswordServiceResult =
  | { ok: true }
  | { ok: false; message: string; status: number }

export async function resetPasswordService(
  body: IResetPasswordRequest
): Promise<TResetPasswordServiceResult> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  if (body.token_hash) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: body.token_hash,
      type: "recovery",
    })

    if (verifyError) {
      console.error("Error al verificar token de recuperación:", verifyError)
      return {
        ok: false,
        message: RECOVERY_MESSAGES.tokenRequired,
        status: 400,
      }
    }
  } else if (body.access_token && body.refresh_token) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: body.access_token,
      refresh_token: body.refresh_token,
    })

    if (sessionError) {
      console.error("Error al establecer sesión de recuperación:", sessionError)
      return {
        ok: false,
        message: RECOVERY_MESSAGES.tokenRequired,
        status: 400,
      }
    }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: body.password,
  })

  if (updateError) {
    console.error("Error al actualizar contraseña:", updateError)
    return {
      ok: false,
      message: RECOVERY_MESSAGES.resetPasswordFailed,
      status: 500,
    }
  }

  return { ok: true }
}
