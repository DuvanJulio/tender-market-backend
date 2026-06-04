import { supabaseAdmin } from "@/lib/supabase/admin"
import type { TApiPedidoEstado } from "@/features/pedidos/interfaces"
import {
  mapPedidoTendero,
  type TRawPedidoItem,
  type TRawPedidoTendero,
} from "@/features/pedidos/server/pedido-mapper"
import { toDbEstado } from "@/features/pedidos/server/pedido-estado"
import { TENDERO_PEDIDOS_MESSAGES } from "./types"

export type TGetPedidosTenderoQuery = {
  tenderoId: number
  contactName?: string
  search?: string
  estado?: TApiPedidoEstado
  historial?: boolean
}

const HISTORIAL_ESTADOS = ["entregado", "cancelado"]
const ACTIVOS_ESTADOS = ["pendiente", "procesando", "enviado"]

type TGetPedidosTenderoServiceResult =
  | {
      ok: true
      data: {
        pedidos: NonNullable<ReturnType<typeof mapPedidoTendero>>[]
        activos_count: number
      }
    }
  | { ok: false; message: string; status: number }

export async function getPedidosTenderoService(
  query: TGetPedidosTenderoQuery
): Promise<TGetPedidosTenderoServiceResult> {
  const { tenderoId, contactName, search, estado, historial } = query

  let dbQuery = supabaseAdmin
    .from("pedidos")
    .select(
      `
      id,
      codigo,
      total,
      estado,
      created_at,
      proveedores(nombre_empresa, telefono),
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
    .eq("tendero_id", tenderoId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (estado) {
    dbQuery = dbQuery.eq("estado", toDbEstado(estado))
  } else if (historial) {
    dbQuery = dbQuery.in("estado", HISTORIAL_ESTADOS)
  } else {
    dbQuery = dbQuery.in("estado", ACTIVOS_ESTADOS)
  }

  const searchTerm = search?.trim()
  if (searchTerm) {
    dbQuery = dbQuery.ilike("codigo", `%${searchTerm}%`)
  }

  const { data: pedidosRows, error } = await dbQuery

  if (error) {
    console.error("Error al cargar pedidos tendero:", error)
    return {
      ok: false,
      message: TENDERO_PEDIDOS_MESSAGES.loadFailed,
      status: 500,
    }
  }

  const rawPedidos = (pedidosRows ?? []) as TRawPedidoTendero[]
  const pedidoIds = rawPedidos.map((p) => p.id)

  const itemsByPedido = new Map<number, TRawPedidoItem[]>()
  if (pedidoIds.length > 0) {
    const { data: itemsRows } = await supabaseAdmin
      .from("pedido_items")
      .select("pedido_id, producto_id, nombre, cantidad, precio_unitario, subtotal")
      .in("pedido_id", pedidoIds)

    for (const item of itemsRows ?? []) {
      const pedidoId = item.pedido_id as number
      const list = itemsByPedido.get(pedidoId) ?? []
      list.push(item as TRawPedidoItem)
      itemsByPedido.set(pedidoId, list)
    }
  }

  let pedidos = rawPedidos
    .map((row) =>
      mapPedidoTendero(row, itemsByPedido.get(row.id), contactName)
    )
    .filter((p): p is NonNullable<typeof p> => p != null)

  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    pedidos = pedidos.filter(
      (p) =>
        p.id.toLowerCase().includes(term) ||
        p.supplier.toLowerCase().includes(term)
    )
  }

  const { count: activosCount } = await supabaseAdmin
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("tendero_id", tenderoId)
    .in("estado", ACTIVOS_ESTADOS)

  return {
    ok: true,
    data: {
      pedidos,
      activos_count: activosCount ?? 0,
    },
  }
}
