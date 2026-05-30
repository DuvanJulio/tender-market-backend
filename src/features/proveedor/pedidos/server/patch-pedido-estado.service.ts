import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IPedidoProveedor, TApiPedidoEstado } from "@/features/pedidos/interfaces"
import {
  mapPedidoProveedor,
  type TRawPedido,
  type TRawPedidoItem,
} from "@/features/pedidos/server/pedido-mapper"
import {
  isValidTransition,
  toApiEstado,
  toDbEstado,
} from "@/features/pedidos/server/pedido-estado"
import { PROVEEDOR_PEDIDOS_MESSAGES } from "./types"

type TPatchPedidoEstadoServiceResult =
  | { ok: true; data: IPedidoProveedor }
  | { ok: false; message: string; status: number }

export async function patchPedidoEstadoService(
  proveedorId: number,
  codigo: string,
  nuevoEstado: TApiPedidoEstado
): Promise<TPatchPedidoEstadoServiceResult> {
  const dbEstado = toDbEstado(nuevoEstado)

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("pedidos")
    .select("id, estado")
    .eq("codigo", codigo)
    .eq("proveedor_id", proveedorId)
    .maybeSingle()

  if (fetchError || !existing) {
    return {
      ok: false,
      message: PROVEEDOR_PEDIDOS_MESSAGES.notFound,
      status: 404,
    }
  }

  const currentApi = toApiEstado(existing.estado as string)
  if (!currentApi) {
    return {
      ok: false,
      message: PROVEEDOR_PEDIDOS_MESSAGES.invalidEstado,
      status: 400,
    }
  }

  const currentDb = toDbEstado(currentApi)
  if (!isValidTransition(currentDb, dbEstado)) {
    return {
      ok: false,
      message: PROVEEDOR_PEDIDOS_MESSAGES.invalidTransition,
      status: 400,
    }
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("pedidos")
    .update({ estado: dbEstado })
    .eq("id", existing.id)
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
    .single()

  if (updateError || !updated) {
    console.error("Error al actualizar pedido:", updateError)
    return {
      ok: false,
      message: PROVEEDOR_PEDIDOS_MESSAGES.updateFailed,
      status: 500,
    }
  }

  const { data: items } = await supabaseAdmin
    .from("pedido_items")
    .select("pedido_id, nombre, cantidad, precio_unitario, subtotal")
    .eq("pedido_id", existing.id)

  const mapped = mapPedidoProveedor(
    updated as TRawPedido,
    (items ?? []) as TRawPedidoItem[]
  )

  if (!mapped) {
    return {
      ok: false,
      message: PROVEEDOR_PEDIDOS_MESSAGES.updateFailed,
      status: 500,
    }
  }

  return { ok: true, data: mapped }
}
