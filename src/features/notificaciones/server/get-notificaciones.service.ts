import { supabaseAdmin } from "@/lib/supabase/admin"
import type { INotificacion } from "../interfaces"
import { isMissingTableError, mapNotificacion } from "./notificacion-mapper"
import { NOTIFICACIONES_MESSAGES } from "./types"

type TGetNotificacionesServiceResult =
  | {
      ok: true
      data: { notificaciones: INotificacion[]; no_leidas: number }
    }
  | { ok: false; message: string; status: number }

export async function getNotificacionesService(
  usuarioId: string,
  limit = 20
): Promise<TGetNotificacionesServiceResult> {
  const { data: rows, error } = await supabaseAdmin
    .from("notificaciones")
    .select("id, tipo, titulo, mensaje, pedido_codigo, leida, created_at")
    .eq("usuario_id", usuarioId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    if (isMissingTableError(error)) {
      return {
        ok: false,
        message: NOTIFICACIONES_MESSAGES.tableMissing,
        status: 503,
      }
    }
    console.error("Error al cargar notificaciones:", error)
    return {
      ok: false,
      message: NOTIFICACIONES_MESSAGES.loadFailed,
      status: 500,
    }
  }

  const notificaciones = (rows ?? []).map(mapNotificacion)

  const { count } = await supabaseAdmin
    .from("notificaciones")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", usuarioId)
    .eq("leida", false)

  return {
    ok: true,
    data: {
      notificaciones,
      no_leidas: count ?? 0,
    },
  }
}
