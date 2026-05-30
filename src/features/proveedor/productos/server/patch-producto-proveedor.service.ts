import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
  IProductoProveedor,
  TPatchProductoProveedorBody,
} from "../interfaces"
import { mapProductoProveedor } from "./producto-mapper"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"

type TPatchProductoProveedorServiceResult =
  | { ok: true; data: IProductoProveedor }
  | { ok: false; message: string; status: number }

export async function patchProductoProveedorService(
  proveedorId: number,
  productoId: number,
  body: TPatchProductoProveedorBody
): Promise<TPatchProductoProveedorServiceResult> {
  const { data: existing } = await supabaseAdmin
    .from("productos")
    .select("id, estado")
    .eq("id", productoId)
    .eq("proveedor_id", proveedorId)
    .maybeSingle()

  if (!existing) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.notFound,
      status: 404,
    }
  }

  const updatePayload: Record<string, unknown> = { ...body }

  if (body.estado === "borrador" && existing.estado === "publicado") {
    updatePayload.estado = "borrador"
  }

  const { data, error } = await supabaseAdmin
    .from("productos")
    .update(updatePayload)
    .eq("id", productoId)
    .eq("proveedor_id", proveedorId)
    .select(
      "id, nombre, precio_mayorista, stock, estado, imagen_url, categoria_id, categorias(nombre)"
    )
    .single()

  if (error || !data) {
    console.error("Error al actualizar producto:", error)
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.updateFailed,
      status: 500,
    }
  }

  return { ok: true, data: mapProductoProveedor(data as never) }
}
