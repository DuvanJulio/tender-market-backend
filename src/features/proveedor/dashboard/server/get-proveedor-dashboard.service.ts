import { supabaseAdmin } from "@/lib/supabase/admin"
import { STOCK_BAJO_UMBRAL } from "@/features/proveedor/productos/server/types"
import {
  mapPedidoProveedor,
  type TRawPedido,
  type TRawPedidoItem,
} from "@/features/pedidos/server/pedido-mapper"
import { ESTADOS_VENTA } from "@/features/pedidos/server/pedido-estado"
import type { IGetProveedorDashboardData } from "../interfaces"

type TGetProveedorDashboardServiceResult =
  | { ok: true; data: IGetProveedorDashboardData }
  | { ok: false; message: string; status: number }

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

async function countProductos(
  proveedorId: number,
  filters?: {
    estado?: string
    bajoStock?: boolean
  }
): Promise<number> {
  let query = supabaseAdmin
    .from("productos")
    .select("id", { count: "exact", head: true })
    .eq("proveedor_id", proveedorId)

  if (filters?.estado) query = query.eq("estado", filters.estado)
  if (filters?.bajoStock) {
    query = query.gt("stock", 0).lte("stock", STOCK_BAJO_UMBRAL)
  }

  const { count } = await query
  return count ?? 0
}

async function sumVentas(
  proveedorId: number,
  from: string,
  to?: string
): Promise<number> {
  let query = supabaseAdmin
    .from("pedidos")
    .select("total")
    .eq("proveedor_id", proveedorId)
    .in("estado", ESTADOS_VENTA)
    .gte("created_at", from)

  if (to) query = query.lt("created_at", to)

  const { data, error } = await query
  if (error) return 0

  return (data ?? []).reduce((sum, row) => sum + Number(row.total), 0)
}

async function countPedidos(
  proveedorId: number,
  from: string,
  to?: string
): Promise<number> {
  let query = supabaseAdmin
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("proveedor_id", proveedorId)
    .gte("created_at", from)

  if (to) query = query.lt("created_at", to)

  const { count, error } = await query
  if (error) return 0
  return count ?? 0
}

async function countClientesActivos(
  proveedorId: number,
  from: string
): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select("tendero_id")
    .eq("proveedor_id", proveedorId)
    .gte("created_at", from)

  if (error || !data) return 0

  return new Set(data.map((r) => r.tendero_id)).size
}

async function fetchTopProductos(proveedorId: number, monthStart: string) {
  const { data: pedidos, error } = await supabaseAdmin
    .from("pedidos")
    .select("id")
    .eq("proveedor_id", proveedorId)
    .gte("created_at", monthStart)
    .neq("estado", "cancelado")

  if (error || !pedidos?.length) return []

  const pedidoIds = pedidos.map((p) => p.id)
  const { data: items } = await supabaseAdmin
    .from("pedido_items")
    .select("nombre, cantidad, subtotal")
    .in("pedido_id", pedidoIds)

  const agg = new Map<string, { sales: number; revenue: number }>()

  for (const item of items ?? []) {
    const nombre = item.nombre as string
    const current = agg.get(nombre) ?? { sales: 0, revenue: 0 }
    current.sales += item.cantidad as number
    current.revenue += Number(item.subtotal)
    agg.set(nombre, current)
  }

  return [...agg.entries()]
    .map(([nombre, stats], index) => ({
      id: index + 1,
      nombre,
      sales: stats.sales,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
}

export async function getProveedorDashboardService(
  proveedorId: number
): Promise<TGetProveedorDashboardServiceResult> {
  const monthStart = startOfMonthIso()
  const prevMonthStart = startOfPreviousMonthIso()
  const todayStart = startOfTodayIso()
  const yesterdayStart = startOfYesterdayIso()

  const [
    productosActivos,
    productosBajoStock,
    stockBajoRows,
    ventasMes,
    ventasMesAnterior,
    pedidosHoy,
    pedidosAyer,
    clientesActivos,
    recentPedidosRes,
    topProductos,
  ] = await Promise.all([
    countProductos(proveedorId, { estado: "publicado" }),
    countProductos(proveedorId, { bajoStock: true }),
    supabaseAdmin
      .from("productos")
      .select("id, nombre, stock")
      .eq("proveedor_id", proveedorId)
      .gt("stock", 0)
      .lte("stock", STOCK_BAJO_UMBRAL)
      .order("stock", { ascending: true })
      .limit(5),
    sumVentas(proveedorId, monthStart),
    sumVentas(proveedorId, prevMonthStart, monthStart),
    countPedidos(proveedorId, todayStart),
    countPedidos(proveedorId, yesterdayStart, todayStart),
    countClientesActivos(proveedorId, monthStart),
    supabaseAdmin
      .from("pedidos")
      .select(
        `
        id,
        codigo,
        total,
        estado,
        created_at,
        tenderos(nombre_tienda, telefono, direcciones(direccion, barrio, ciudades(nombre)))
      `
      )
      .eq("proveedor_id", proveedorId)
      .order("created_at", { ascending: false })
      .limit(4),
    fetchTopProductos(proveedorId, monthStart),
  ])

  const recentIds = (recentPedidosRes.data ?? []).map(
    (p) => (p as TRawPedido).id
  )

  let itemsByPedido = new Map<number, TRawPedidoItem[]>()
  if (recentIds.length > 0) {
    const { data: items } = await supabaseAdmin
      .from("pedido_items")
      .select("pedido_id, nombre, cantidad, precio_unitario, subtotal")
      .in("pedido_id", recentIds)

    for (const item of items ?? []) {
      const pedidoId = item.pedido_id as number
      const list = itemsByPedido.get(pedidoId) ?? []
      list.push(item as TRawPedidoItem)
      itemsByPedido.set(pedidoId, list)
    }
  }

  const pedidosRecientes = (recentPedidosRes.data ?? [])
    .map((row) =>
      mapPedidoProveedor(row as TRawPedido, itemsByPedido.get((row as TRawPedido).id))
    )
    .filter((p): p is NonNullable<typeof p> => p != null)
    .map((p) => ({
      id: p.id,
      customer: p.customer,
      items: p.items,
      total: p.total,
      status: p.status,
      occurred_at: p.occurred_at,
    }))

  return {
    ok: true,
    data: {
      kpis: {
        ventas_mes: ventasMes,
        ventas_cambio_porcentaje: calcPercentChange(
          ventasMes,
          ventasMesAnterior
        ),
        pedidos_nuevos: pedidosHoy,
        pedidos_nuevos_vs_ayer: pedidosHoy - pedidosAyer,
        productos_activos: productosActivos,
        productos_bajo_stock: productosBajoStock,
        clientes_activos: clientesActivos,
        clientes_nuevos_mes: 0,
      },
      pedidos_recientes: pedidosRecientes,
      stock_bajo: (stockBajoRows.data ?? []).map((row) => ({
        id: row.id as number,
        nombre: row.nombre as string,
        stock: row.stock as number,
        min_stock: STOCK_BAJO_UMBRAL,
      })),
      top_productos: topProductos.map((p, index) => ({
        id: index + 1,
        nombre: p.nombre,
        sales: p.sales,
        revenue: p.revenue,
      })),
    },
  }
}
