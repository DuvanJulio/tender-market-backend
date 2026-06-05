import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
  ICityStatsItem,
  IGetStatsResponseData,
  IPendingApprovalItem,
  IRecentActivityItem,
  ITopCiudadStats,
} from "../../interfaces"
import { STATS_MESSAGES } from "./types"

function buildCityStatsMap(cityIds: number[]): Map<number, ICityStatsItem> {
  const map = new Map<number, ICityStatsItem>()
  for (const ciudad_id of cityIds) {
    map.set(ciudad_id, { ciudad_id, tenderos: 0, proveedores: 0 })
  }
  return map
}

function startOfMonthIso(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function startOfPreviousMonthIso(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
}

function startOfTodayIso(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
}

function startOfYesterdayIso(): string {
  const today = new Date(startOfTodayIso())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString()
}

function calcPercentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 1000) / 10
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

async function countNewProfilesThisMonth(
  table: "tenderos" | "proveedores",
  monthStart: string
): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from(table)
    .select("usuario_id, usuarios!inner(created_at)", { count: "exact", head: true })
    .gte("usuarios.created_at", monthStart)

  if (error) {
    console.error(`Error al contar ${table} nuevos del mes:`, error)
    return 0
  }

  return count ?? 0
}

async function fetchPendingApprovals(
  pendienteEstadoId: number
): Promise<IPendingApprovalItem[]> {
  const { data: usuarios, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, created_at, roles(nombre)")
    .eq("estado_id", pendienteEstadoId)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error || !usuarios?.length) return []

  const items: IPendingApprovalItem[] = []

  for (const row of usuarios) {
    const roles = row.roles as { nombre: string } | { nombre: string }[] | null
    const rolNombre = Array.isArray(roles) ? roles[0]?.nombre : roles?.nombre

    if (rolNombre !== "tendero" && rolNombre !== "proveedor") continue

    let nombre = "Sin nombre"

    if (rolNombre === "tendero") {
      const { data: tendero } = await supabaseAdmin
        .from("tenderos")
        .select("nombre_tienda")
        .eq("usuario_id", row.id)
        .maybeSingle()
      nombre = tendero?.nombre_tienda ?? nombre
    } else {
      const { data: proveedor } = await supabaseAdmin
        .from("proveedores")
        .select("nombre_empresa")
        .eq("usuario_id", row.id)
        .maybeSingle()
      nombre = proveedor?.nombre_empresa ?? nombre
    }

    items.push({
      id: row.id as string,
      nombre,
      fecha_registro: row.created_at as string,
      tipo: rolNombre,
    })
  }

  return items.slice(0, 5)
}

type TRawPedidoCiudad = {
  total: number
  tenderos:
    | {
        direccion_id: number | null
        direcciones:
          | { ciudad_id: number }
          | { ciudad_id: number }[]
          | null
      }
    | {
        direccion_id: number | null
        direcciones:
          | { ciudad_id: number }
          | { ciudad_id: number }[]
          | null
      }[]
    | null
}

function pickCiudadIdFromPedido(row: TRawPedidoCiudad): number | null {
  const tenderos = row.tenderos
  if (!tenderos) return null

  const tendero = Array.isArray(tenderos) ? tenderos[0] : tenderos
  const direcciones = tendero?.direcciones
  if (!direcciones) return null

  const dir = Array.isArray(direcciones) ? direcciones[0] : direcciones
  const ciudadId = dir?.ciudad_id
  return typeof ciudadId === "number" ? ciudadId : null
}

async function sumPedidosRevenue(from?: string, to?: string): Promise<number> {
  let query = supabaseAdmin
    .from("pedidos")
    .select("total")
    .neq("estado", "cancelado")

  if (from) query = query.gte("created_at", from)
  if (to) query = query.lt("created_at", to)

  const { data, error } = await query
  if (error) {
    console.error("Error al sumar ingresos de pedidos:", error)
    return 0
  }

  return (data ?? []).reduce((sum, row) => sum + Number(row.total), 0)
}

async function countPedidos(from: string, to?: string): Promise<number> {
  let query = supabaseAdmin
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .gte("created_at", from)
    .neq("estado", "cancelado")

  if (to) query = query.lt("created_at", to)

  const { count, error } = await query
  if (error) {
    console.error("Error al contar pedidos:", error)
    return 0
  }

  return count ?? 0
}

async function fetchPedidosStatsByCiudad(
  cityIds: number[]
): Promise<Map<number, { pedidos: number; ingresos: number }>> {
  const map = new Map<number, { pedidos: number; ingresos: number }>()
  if (cityIds.length === 0) return map

  const allowedCityIds = new Set(cityIds)

  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select("total, tenderos(direccion_id, direcciones(ciudad_id))")
    .neq("estado", "cancelado")

  if (error) {
    console.error("Error al cargar pedidos por ciudad:", error)
    return map
  }

  for (const row of (data ?? []) as TRawPedidoCiudad[]) {
    const ciudadId = pickCiudadIdFromPedido(row)
    if (!ciudadId || !allowedCityIds.has(ciudadId)) continue

    const current = map.get(ciudadId) ?? { pedidos: 0, ingresos: 0 }
    current.pedidos += 1
    current.ingresos += Number(row.total)
    map.set(ciudadId, current)
  }

  return map
}

async function fetchRecentActivity(): Promise<IRecentActivityItem[]> {
  const activities: IRecentActivityItem[] = []

  const { data: pedidosRecientes } = await supabaseAdmin
    .from("pedidos")
    .select(
      "codigo, total, created_at, tenderos(nombre_tienda), proveedores(nombre_empresa)"
    )
    .neq("estado", "cancelado")
    .order("created_at", { ascending: false })
    .limit(3)

  for (const row of pedidosRecientes ?? []) {
    const tenderos = row.tenderos as
      | { nombre_tienda: string }
      | { nombre_tienda: string }[]
      | null
    const proveedores = row.proveedores as
      | { nombre_empresa: string }
      | { nombre_empresa: string }[]
      | null

    const tendero = Array.isArray(tenderos) ? tenderos[0] : tenderos
    const proveedor = Array.isArray(proveedores) ? proveedores[0] : proveedores

    activities.push({
      type: "order",
      action: "Nuevo pedido",
      name: `${tendero?.nombre_tienda ?? "Tendero"} · ${proveedor?.nombre_empresa ?? "Proveedor"}`,
      occurred_at: row.created_at as string,
    })
  }

  const { data: nuevosUsuarios } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, apellido, created_at, roles(nombre)")
    .order("created_at", { ascending: false })
    .limit(5)

  for (const row of nuevosUsuarios ?? []) {
    const roles = row.roles as { nombre: string } | { nombre: string }[] | null
    const rolNombre = Array.isArray(roles) ? roles[0]?.nombre : roles?.nombre
    const nombre = [row.nombre, row.apellido].filter(Boolean).join(" ").trim()

    activities.push({
      type: rolNombre === "proveedor" ? "supplier" : "user",
      action:
        rolNombre === "proveedor"
          ? "Nuevo proveedor registrado"
          : "Nuevo tendero registrado",
      name: nombre || "Usuario",
      occurred_at: row.created_at as string,
    })
  }

  const { data: productosBorrador } = await supabaseAdmin
    .from("productos")
    .select("id, nombre, created_at")
    .eq("estado", "borrador")
    .order("created_at", { ascending: false })
    .limit(3)

  for (const producto of productosBorrador ?? []) {
    activities.push({
      type: "product",
      action: "Producto pendiente de revisión",
      name: producto.nombre as string,
      occurred_at: (producto.created_at as string) ?? new Date().toISOString(),
    })
  }

  return activities
    .sort(
      (a, b) =>
        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    )
    .slice(0, 5)
}

function buildTopCiudades(
  ciudades: { id: number; nombre: string }[],
  porCiudadMap: Map<number, ICityStatsItem>,
  pedidosByCiudad: Map<number, { pedidos: number; ingresos: number }>
): ITopCiudadStats[] {
  return ciudades
    .map((ciudad) => {
      const stats = porCiudadMap.get(ciudad.id)
      const pedidosStats = pedidosByCiudad.get(ciudad.id)
      const usuarios = (stats?.tenderos ?? 0) + (stats?.proveedores ?? 0)
      return {
        ciudad_id: ciudad.id,
        nombre: ciudad.nombre,
        usuarios,
        pedidos: pedidosStats?.pedidos ?? 0,
        ingresos: pedidosStats?.ingresos ?? 0,
      }
    })
    .filter((c) => c.usuarios > 0 || c.pedidos > 0)
    .sort((a, b) => b.ingresos - a.ingresos || b.pedidos - a.pedidos)
    .slice(0, 5)
}

type TGetStatsServiceResult =
  | { ok: true; data: IGetStatsResponseData }
  | { ok: false; message: string; status: number }

export async function getStatsService(): Promise<TGetStatsServiceResult> {
  const [{ data: estadoActivo }, { data: estadoPendiente }] = await Promise.all([
    supabaseAdmin
      .from("estados_usuarios")
      .select("id")
      .eq("nombre", "activo")
      .maybeSingle(),
    supabaseAdmin
      .from("estados_usuarios")
      .select("id")
      .eq("nombre", "pendiente")
      .maybeSingle(),
  ])

  const estadoActivoId = estadoActivo?.id
  const estadoPendienteId = estadoPendiente?.id

  if (!estadoActivoId) {
    return {
      ok: false,
      message: STATS_MESSAGES.activeStatusNotFound,
      status: 500,
    }
  }

  const monthStart = startOfMonthIso()
  const prevMonthStart = startOfPreviousMonthIso()
  const todayStart = startOfTodayIso()
  const yesterdayStart = startOfYesterdayIso()

  const [
    tenderosCount,
    proveedoresCount,
    tenderosNuevosMes,
    proveedoresNuevosMes,
    ciudadesRes,
    aprobacionesPendientes,
    actividadReciente,
    ingresosTotales,
    ingresosMesActual,
    ingresosMesAnterior,
    pedidosHoy,
    pedidosAyer,
    pedidosMensuales,
    productosTotal,
  ] = await Promise.all([
    supabaseAdmin
      .from("tenderos")
      .select("usuarios!inner(estado_id)", { count: "exact", head: true })
      .eq("usuarios.estado_id", estadoActivoId),
    supabaseAdmin
      .from("proveedores")
      .select("usuarios!inner(estado_id)", { count: "exact", head: true })
      .eq("usuarios.estado_id", estadoActivoId),
    countNewProfilesThisMonth("tenderos", monthStart),
    countNewProfilesThisMonth("proveedores", monthStart),
    supabaseAdmin.from("ciudades").select("id, nombre").eq("estado", true),
    estadoPendienteId
      ? fetchPendingApprovals(estadoPendienteId)
      : Promise.resolve([]),
    fetchRecentActivity(),
    sumPedidosRevenue(),
    sumPedidosRevenue(monthStart),
    sumPedidosRevenue(prevMonthStart, monthStart),
    countPedidos(todayStart),
    countPedidos(yesterdayStart, todayStart),
    countPedidos(monthStart),
    supabaseAdmin
      .from("productos")
      .select("id", { count: "exact", head: true }),
  ])

  if (tenderosCount.error || proveedoresCount.error) {
    return {
      ok: false,
      message: STATS_MESSAGES.loadFailed,
      status: 500,
    }
  }

  const ciudades = ciudadesRes.data ?? []
  const cityIds = ciudades.map((c) => c.id)
  const porCiudadMap = buildCityStatsMap(cityIds)

  await Promise.all([
    countProfilesByCity("tenderos", estadoActivoId, porCiudadMap),
    countProfilesByCity("proveedores", estadoActivoId, porCiudadMap),
  ])

  const pedidosByCiudad = await fetchPedidosStatsByCiudad(cityIds)

  return {
    ok: true,
    data: {
      tenderos_activos: tenderosCount.count ?? 0,
      proveedores_activos: proveedoresCount.count ?? 0,
      por_ciudad: Array.from(porCiudadMap.values()),
      tenderos_nuevos_mes: tenderosNuevosMes,
      proveedores_nuevos_mes: proveedoresNuevosMes,
      ingresos_totales: ingresosTotales,
      ingresos_cambio_porcentaje: calcPercentChange(
        ingresosMesActual,
        ingresosMesAnterior
      ),
      pedidos_hoy: pedidosHoy,
      pedidos_cambio_porcentaje: calcPercentChange(pedidosHoy, pedidosAyer),
      pedidos_mensuales: pedidosMensuales,
      productos_total: productosTotal.error ? 0 : (productosTotal.count ?? 0),
      aprobaciones_pendientes: aprobacionesPendientes,
      actividad_reciente: actividadReciente,
      top_ciudades: buildTopCiudades(ciudades, porCiudadMap, pedidosByCiudad),
    },
  }
}
