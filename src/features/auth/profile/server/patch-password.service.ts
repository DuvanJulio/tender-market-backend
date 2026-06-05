import { createClient } from "@supabase/supabase-js"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IPatchPasswordBody } from "../interfaces"
import { PROFILE_MESSAGES } from "./types"

type TPatchPasswordServiceResult =
  | { ok: true }
  | { ok: false; message: string; status: number }

export async function patchPasswordService(
  request: Request,
  body: IPatchPasswordBody
): Promise<TPatchPasswordServiceResult> {
  const authUser = await getAuthUserFromRequest(request)

  if (!authUser?.email) {
    return {
      ok: false,
      message: PROFILE_MESSAGES.unauthorized,
      status: 401,
    }
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authUser.email,
    password: body.current_password,
  })

  if (signInError) {
    return {
      ok: false,
      message: PROFILE_MESSAGES.currentPasswordInvalid,
      status: 401,
    }
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    authUser.id,
    { password: body.new_password }
  )

  if (updateError) {
    console.error("Error al actualizar contraseña:", updateError)
    return {
      ok: false,
      message: PROFILE_MESSAGES.passwordUpdateFailed,
      status: 500,
    }
  }

  return { ok: true }
}
