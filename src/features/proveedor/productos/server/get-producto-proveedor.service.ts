import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IProductoProveedor } from "../interfaces"
import { mapProductoProveedor } from "./producto-mapper"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"

type TGetProductoProveedorServiceResult =
  | { ok: true; data: IProductoProveedor }
  | { ok: false; message: string; status: number }

export async function getProductoProveedorService(
  proveedorId: number,
  productoId: number
): Promise<TGetProductoProveedorServiceResult> {
  if (!productoId || Number.isNaN(productoId)) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.notFound,
      status: 400,
    }
  }

  const { data, error } = await supabaseAdmin
    .from("productos")
    .select(
      "id, nombre, precio_mayorista, stock, estado, imagen_url, categoria_id, categorias(nombre)"
    )
    .eq("id", productoId)
    .eq("proveedor_id", proveedorId)
    .maybeSingle()

  if (error || !data) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.notFound,
      status: 404,
    }
  }

  return { ok: true, data: mapProductoProveedor(data as never) }
}
