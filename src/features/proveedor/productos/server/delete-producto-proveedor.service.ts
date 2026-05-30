import { supabaseAdmin } from "@/lib/supabase/admin"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"

type TDeleteProductoProveedorServiceResult =
  | { ok: true; id: number }
  | { ok: false; message: string; status: number }

export async function deleteProductoProveedorService(
  proveedorId: number,
  productoId: number
): Promise<TDeleteProductoProveedorServiceResult> {
  if (!productoId || Number.isNaN(productoId)) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.notFound,
      status: 400,
    }
  }

  const { data: producto } = await supabaseAdmin
    .from("productos")
    .select("id")
    .eq("id", productoId)
    .eq("proveedor_id", proveedorId)
    .maybeSingle()

  if (!producto) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.notFound,
      status: 404,
    }
  }

  const { error } = await supabaseAdmin
    .from("productos")
    .delete()
    .eq("id", productoId)
    .eq("proveedor_id", proveedorId)

  if (error) {
    console.error("Error al eliminar producto del proveedor:", error)
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.deleteFailed,
      status: 500,
    }
  }

  return { ok: true, id: productoId }
}
