import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ICityStatsItem, IGetStatsResponseData } from "../../interfaces"
import { STATS_MESSAGES } from "./types"

function buildCityStatsMap(cityIds: number[]): Map<number, ICityStatsItem> {
  const map = new Map<number, ICityStatsItem>()
  for (const ciudad_id of cityIds) {
    map.set(ciudad_id, { ciudad_id, tenderos: 0, proveedores: 0 })
  }
  return map
}

async function countProfilesByCity(
  table: "tenderos" | "proveedores",
  estadoId: number,
  porCiudadMap: Map<number, ICityStatsItem>
) {
  const { data: profiles, error } = await supabaseAdmin
    .from(table)
    .select("direccion_id, usuarios!inner(estado_id)")
    .eq("usuarios.estado_id", estadoId)

  if (error) {
    console.error(`Error al contar ${table} por ciudad:`, error)
    return
  }

  const direccionIds = [
    ...new Set(
      (profiles ?? [])
        .map((row) => row.direccion_id as number | null)
        .filter((id): id is number => typeof id === "number")
    ),
  ]

  if (direccionIds.length === 0) return

  const { data: direcciones, error: direccionesError } = await supabaseAdmin
    .from("direcciones")
    .select("id, ciudad_id")
    .in("id", direccionIds)

  if (direccionesError) {
    console.error(`Error al resolver direcciones para ${table}:`, direccionesError)
    return
  }

  const ciudadByDireccion = new Map(
    (direcciones ?? []).map((d) => [d.id, d.ciudad_id as number])
  )

  for (const profile of profiles ?? []) {
    const ciudadId = ciudadByDireccion.get(profile.direccion_id as number)
    if (!ciudadId || !porCiudadMap.has(ciudadId)) continue

    const stats = porCiudadMap.get(ciudadId)!
    if (table === "tenderos") {
      stats.tenderos += 1
    } else {
      stats.proveedores += 1
    }
  }
}

type TGetStatsServiceResult =
  | { ok: true; data: IGetStatsResponseData }
  | { ok: false; message: string; status: number }

export async function getStatsService(): Promise<TGetStatsServiceResult> {
  const { data: estadoActivo } = await supabaseAdmin
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

  const { count: tenderos, error: errorTenderos } = await supabaseAdmin
    .from("tenderos")
    .select("usuarios!inner(estado_id)", { count: "exact", head: true })
    .eq("usuarios.estado_id", estadoId)

  const { count: proveedores, error: errorProveedores } = await supabaseAdmin
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

  const { data: ciudades, error: ciudadesError } = await supabaseAdmin
    .from("ciudades")
    .select("id")

  const cityIds = ciudadesError ? [] : (ciudades ?? []).map((c) => c.id)
  const porCiudadMap = buildCityStatsMap(cityIds)

  await countProfilesByCity("tenderos", estadoId, porCiudadMap)
  await countProfilesByCity("proveedores", estadoId, porCiudadMap)

  return {
    ok: true,
    data: {
      tenderos_activos: tenderos ?? 0,
      proveedores_activos: proveedores ?? 0,
      por_ciudad: Array.from(porCiudadMap.values()),
    },
  }
}
