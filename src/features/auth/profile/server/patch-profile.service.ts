import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IPatchProfileBody, IPatchProfileResponseData } from "../interfaces"
import { PROFILE_MESSAGES } from "./types"
type TPatchProfileServiceResult =
  | { ok: true; data: IPatchProfileResponseData }
  | { ok: false; message: string; status: number }

export async function patchProfileService(
  request: Request,
  body: IPatchProfileBody
): Promise<TPatchProfileServiceResult> {
  const authUser = await getAuthUserFromRequest(request)

  if (!authUser) {
    return {
      ok: false,
      message: PROFILE_MESSAGES.unauthorized,
      status: 401,
    }
  }

  const currentEmail = authUser.email?.trim().toLowerCase()
  const result: IPatchProfileResponseData = {}

  if (body.email !== undefined) {
    const newEmail = body.email.trim().toLowerCase()

    if (newEmail !== currentEmail) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        authUser.id,
        { email: newEmail, email_confirm: true }
      )

      if (authError) {
        const msg = authError.message.toLowerCase()
        if (msg.includes("already") || msg.includes("registered")) {
          return {
            ok: false,
            message: PROFILE_MESSAGES.emailInUse,
            status: 409,
          }
        }
        console.error("Error al actualizar email:", authError)
        return {
          ok: false,
          message: PROFILE_MESSAGES.updateFailed,
          status: 500,
        }
      }

      result.email = newEmail
    } else {
      result.email = currentEmail
    }
  }

  if (body.telefono !== undefined) {
    const { error } = await supabaseAdmin
      .from("usuarios")
      .update({ telefono: body.telefono.trim() })
      .eq("id", authUser.id)

    if (error) {
      console.error("Error al actualizar teléfono:", error)
      return {
        ok: false,
        message: PROFILE_MESSAGES.updateFailed,
        status: 500,
      }
    }

    result.telefono = body.telefono.trim()
  }

  return { ok: true, data: result }
}
