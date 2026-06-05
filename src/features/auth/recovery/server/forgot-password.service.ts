import { createClient } from "@supabase/supabase-js"
import { getFrontendUrl } from "@/lib/auth/get-frontend-url"
import { RECOVERY_MESSAGES } from "./types"

type TForgotPasswordServiceResult =
  | { ok: true }
  | { ok: false; message: string; status: number }

export async function forgotPasswordService(
  email: string
): Promise<TForgotPasswordServiceResult> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getFrontendUrl()}/reset-password`,
  })

  if (error) {
    console.error("Error en forgot-password:", error)
    return {
      ok: false,
      message: RECOVERY_MESSAGES.forgotPasswordFailed,
      status: 500,
    }
  }

  return { ok: true }
}
