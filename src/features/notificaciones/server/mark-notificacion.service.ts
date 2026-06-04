import { supabaseAdmin } from "@/lib/supabase/admin"
import { isMissingTableError } from "./notificacion-mapper"
import { NOTIFICACIONES_MESSAGES } from "./types"

type TMarkNotificacionResult =
  | { ok: true; data: { no_leidas: number } }
  | { ok: false; message: string; status: number }

async function countNoLeidas(usuarioId: string) {
  const { count } = await supabaseAdmin
    .from("notificaciones")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", usuarioId)
    .eq("leida", false)

  return count ?? 0
}

export async function markNotificacionLeidaService(
  usuarioId: string,
  notificacionId: number
): Promise<TMarkNotificacionResult> {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("notificaciones")
    .select("id")
    .eq("id", notificacionId)
    .eq("usuario_id", usuarioId)
    .maybeSingle()

  if (fetchError) {
    if (isMissingTableError(fetchError)) {
      return {
        ok: false,
        message: NOTIFICACIONES_MESSAGES.tableMissing,
        status: 503,
      }
    }
    return {
      ok: false,
      message: NOTIFICACIONES_MESSAGES.markReadFailed,
      status: 500,
    }
  }

  if (!existing) {
    return {
      ok: false,
      message: NOTIFICACIONES_MESSAGES.notFound,
      status: 404,
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from("notificaciones")
    .update({ leida: true })
    .eq("id", notificacionId)
    .eq("usuario_id", usuarioId)

  if (updateError) {
    console.error("Error al marcar notificación:", updateError)
    return {
      ok: false,
      message: NOTIFICACIONES_MESSAGES.markReadFailed,
      status: 500,
    }
  }

  return {
    ok: true,
    data: { no_leidas: await countNoLeidas(usuarioId) },
  }
}

export async function markAllNotificacionesLeidasService(
  usuarioId: string
): Promise<TMarkNotificacionResult> {
  const { error } = await supabaseAdmin
    .from("notificaciones")
    .update({ leida: true })
    .eq("usuario_id", usuarioId)
    .eq("leida", false)

  if (error) {
    if (isMissingTableError(error)) {
      return {
        ok: false,
        message: NOTIFICACIONES_MESSAGES.tableMissing,
        status: 503,
      }
    }
    console.error("Error al marcar notificaciones:", error)
    return {
      ok: false,
      message: NOTIFICACIONES_MESSAGES.markReadFailed,
      status: 500,
    }
  }

  return {
    ok: true,
    data: { no_leidas: 0 },
  }
}
