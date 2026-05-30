import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IPedidoProveedor, TApiPedidoEstado } from "@/features/pedidos/interfaces"
import {
  mapPedidoProveedor,
  type TRawPedido,
  type TRawPedidoItem,
} from "@/features/pedidos/server/pedido-mapper"
import { toDbEstado } from "@/features/pedidos/server/pedido-estado"
import { PROVEEDOR_PEDIDOS_MESSAGES } from "./types"

export type TGetPedidosProveedorQuery = {
  proveedorId: number
  search?: string
  estado?: TApiPedidoEstado
}

type TGetPedidosProveedorServiceResult =
  | {
      ok: true
      data: { pedidos: IPedidoProveedor[]; pendientes_count: number }
    }
  | { ok: false; message: string; status: number }

function isMissingTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return (
    error.code === "42P01" ||
    error.message?.includes("pedidos") ||
    error.message?.includes("does not exist")
  )
}

export async function getPedidosProveedorService(
  query: TGetPedidosProveedorQuery
): Promise<TGetPedidosProveedorServiceResult> {
  const { proveedorId, search, estado } = query

  let dbQuery = supabaseAdmin
    .from("pedidos")
    .select(
      `
      id,
      codigo,
      total,
      estado,
      created_at,
      tenderos(
        nombre_tienda,
        telefono,
        direcciones(
          direccion,
          barrio,
          ciudades(nombre)
        )
      )
    `
    )
    .eq("proveedor_id", proveedorId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (estado) {
    dbQuery = dbQuery.eq("estado", toDbEstado(estado))
  }

  const searchTerm = search?.trim()
  if (searchTerm) {
    dbQuery = dbQuery.ilike("codigo", `%${searchTerm}%`)
  }

  const { data: pedidosRows, error } = await dbQuery

  if (error) {
    if (isMissingTableError(error)) {
      return {
        ok: false,
        message: PROVEEDOR_PEDIDOS_MESSAGES.tableMissing,
        status: 503,
      }
    }
    console.error("Error al cargar pedidos:", error)
    return {
      ok: false,
      message: PROVEEDOR_PEDIDOS_MESSAGES.loadFailed,
      status: 500,
    }
  }

  const rawPedidos = (pedidosRows ?? []) as TRawPedido[]
  const pedidoIds = rawPedidos.map((p) => p.id)

  let itemsByPedido = new Map<number, TRawPedidoItem[]>()

  if (pedidoIds.length > 0) {
    const { data: itemsRows, error: itemsError } = await supabaseAdmin
      .from("pedido_items")
      .select("pedido_id, nombre, cantidad, precio_unitario, subtotal")
      .in("pedido_id", pedidoIds)

    if (itemsError && !isMissingTableError(itemsError)) {
      console.error("Error al cargar items de pedidos:", itemsError)
    } else {
      for (const item of itemsRows ?? []) {
        const pedidoId = item.pedido_id as number
        const list = itemsByPedido.get(pedidoId) ?? []
        list.push(item as TRawPedidoItem)
        itemsByPedido.set(pedidoId, list)
      }
    }
  }

  let pedidos: IPedidoProveedor[] = []

  for (const row of rawPedidos) {
    const mapped = mapPedidoProveedor(row, itemsByPedido.get(row.id))
    if (mapped) pedidos.push(mapped)
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    pedidos = pedidos.filter(
      (p) =>
        p.id.toLowerCase().includes(term) ||
        p.customer.toLowerCase().includes(term)
    )
  }

  const { count: pendientesCount } = await supabaseAdmin
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("proveedor_id", proveedorId)
    .eq("estado", toDbEstado("pending")!)

  return {
    ok: true,
    data: {
      pedidos,
      pendientes_count: pendientesCount ?? 0,
    },
  }
}
