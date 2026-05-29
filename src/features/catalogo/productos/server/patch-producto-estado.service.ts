import { supabaseAdmin } from "@/lib/supabase/admin"
import type { TPatchProductoEstadoBody, TProductoEstadoDb } from "../interfaces"
import { PRODUCTOS_MESSAGES } from "./types"

type TPatchProductoEstadoServiceResult =
  | { ok: true; data: { id: number; estado: TProductoEstadoDb } }
  | { ok: false; message: string; status: number }

const ALLOWED_TARGET_ESTADOS: TProductoEstadoDb[] = ["publicado", "inactivo"]

export async function patchProductoEstadoService(
  productoId: number,
  body: TPatchProductoEstadoBody
): Promise<TPatchProductoEstadoServiceResult> {
  if (!productoId || Number.isNaN(productoId)) {
    return {
      ok: false,
      message: PRODUCTOS_MESSAGES.notFound,
      status: 400,
    }
  }

  if (!ALLOWED_TARGET_ESTADOS.includes(body.estado)) {
    return {
      ok: false,
      message: PRODUCTOS_MESSAGES.invalidEstado,
      status: 400,
    }
  }

  const { data: producto } = await supabaseAdmin
    .from("productos")
    .select("id, estado")
    .eq("id", productoId)
    .maybeSingle()

  if (!producto) {
    return {
      ok: false,
      message: PRODUCTOS_MESSAGES.notFound,
      status: 404,
    }
  }

  if (producto.estado !== "borrador") {
    return {
      ok: false,
      message: PRODUCTOS_MESSAGES.onlyBorradorCanModerate,
      status: 409,
    }
  }

  const { data, error } = await supabaseAdmin
    .from("productos")
    .update({ estado: body.estado })
    .eq("id", productoId)
    .select("id, estado")
    .single()

  if (error || !data) {
    console.error("Error al actualizar estado del producto:", error)
    return {
      ok: false,
      message: PRODUCTOS_MESSAGES.updateFailed,
      status: 500,
    }
  }

  return {
    ok: true,
    data: {
      id: data.id,
      estado: data.estado as TProductoEstadoDb,
    },
  }
}
