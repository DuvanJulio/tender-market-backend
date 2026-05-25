import { createClient } from "@/lib/supabase/server"
import type { IGetStatsResponseData } from "../../interfaces"
import { STATS_MESSAGES } from "./types"

type TGetStatsServiceResult =
  | { ok: true; data: IGetStatsResponseData }
  | { ok: false; message: string; status: number }

export async function getStatsService(): Promise<TGetStatsServiceResult> {
  const supabase = await createClient()

  const { data: estadoActivo } = await supabase
    .from("estados_usuarios")
    .select("id")
    .eq("nombre", "activo")
    .single()

  const estadoId = estadoActivo?.id

  if (!estadoId) {
    return {
      ok: false,
      message: STATS_MESSAGES.activeStatusNotFound,
      status: 500,
    }
  }

  const { count: tenderos, error: errorTenderos } = await supabase
    .from("tenderos")
    .select("usuarios!inner(estado_id)", { count: "exact", head: true })
    .eq("usuarios.estado_id", estadoId)

  const { count: proveedores, error: errorProveedores } = await supabase
    .from("proveedores")
    .select("usuarios!inner(estado_id)", { count: "exact", head: true })
    .eq("usuarios.estado_id", estadoId)

  if (errorTenderos || errorProveedores) {
    return {
      ok: false,
      message: STATS_MESSAGES.loadFailed,
      status: 500,
    }
  }

  return {
    ok: true,
    data: {
      tenderos_activos: tenderos ?? 0,
      proveedores_activos: proveedores ?? 0,
    },
  }
}
