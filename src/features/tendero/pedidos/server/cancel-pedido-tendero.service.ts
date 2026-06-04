import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  mapPedidoTendero,
  type TRawPedidoItem,
  type TRawPedidoTendero,
} from "@/features/pedidos/server/pedido-mapper"
import type { TDbPedidoEstado } from "@/features/pedidos/interfaces"
import {
  canTenderoCancelEstado,
} from "@/features/pedidos/server/pedido-estado"
import { TENDERO_PEDIDOS_MESSAGES } from "./types"
import { notifyProveedorPedidoCancelado } from "@/features/notificaciones/server/pedido-notificacion.helper"

type TCancelPedidoTenderoServiceResult =
  | { ok: true; data: NonNullable<ReturnType<typeof mapPedidoTendero>> }
  | { ok: false; message: string; status: number }

export async function cancelPedidoTenderoService(
  tenderoId: number,
  codigo: string,
  contactName?: string
): Promise<TCancelPedidoTenderoServiceResult> {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("pedidos")
    .select(
      `
      id,
      estado,
      codigo,
      proveedor_id,
      tenderos(nombre_tienda)
    `
    )
    .eq("codigo", codigo)
    .eq("tendero_id", tenderoId)
    .maybeSingle()

  if (fetchError || !existing) {
    return {
      ok: false,
      message: TENDERO_PEDIDOS_MESSAGES.notFound,
      status: 404,
    }
  }

  if (!canTenderoCancelEstado(existing.estado as TDbPedidoEstado)) {
    return {
      ok: false,
      message: TENDERO_PEDIDOS_MESSAGES.invalidTransition,
      status: 400,
    }
  }

  const { data: itemsBeforeCancel } = await supabaseAdmin
    .from("pedido_items")
    .select("producto_id, cantidad")
    .eq("pedido_id", existing.id)

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("pedidos")
    .update({ estado: "cancelado" })
    .eq("id", existing.id)
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
    .single()

  if (updateError || !updated) {
    console.error("Error al cancelar pedido:", updateError)
    return {
      ok: false,
      message: TENDERO_PEDIDOS_MESSAGES.cancelFailed,
      status: 500,
    }
  }

  for (const item of itemsBeforeCancel ?? []) {
    if (!item.producto_id) continue
    const { data: producto } = await supabaseAdmin
      .from("productos")
      .select("stock")
      .eq("id", item.producto_id)
      .maybeSingle()

    if (producto) {
      await supabaseAdmin
        .from("productos")
        .update({
          stock: (producto.stock as number) + (item.cantidad as number),
        })
        .eq("id", item.producto_id)
    }
  }

  const { data: items } = await supabaseAdmin
    .from("pedido_items")
    .select("pedido_id, nombre, cantidad, precio_unitario, subtotal")
    .eq("pedido_id", existing.id)

  const mapped = mapPedidoTendero(
    updated as TRawPedidoTendero,
    (items ?? []) as TRawPedidoItem[],
    contactName
  )

  if (!mapped) {
    return {
      ok: false,
      message: TENDERO_PEDIDOS_MESSAGES.cancelFailed,
      status: 500,
    }
  }

  const tenderos = existing.tenderos as
    | { nombre_tienda: string }
    | { nombre_tienda: string }[]
    | null
  const nombreTienda = Array.isArray(tenderos)
    ? tenderos[0]?.nombre_tienda
    : tenderos?.nombre_tienda

  await notifyProveedorPedidoCancelado({
    proveedorId: existing.proveedor_id as number,
    pedidoCodigo: codigo,
    nombreTienda: nombreTienda ?? "Tendero",
  })

  return { ok: true, data: mapped }
}
